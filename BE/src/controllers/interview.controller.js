const InterviewSession = require('../models/interview-session.model');
const Question         = require('../models/question.model');
const Answer           = require('../models/answer.model');
const Feedback         = require('../models/feedback.model');
const { gradeAnswer, generateSessionFeedback } = require('../services/ai.service');

// ─────────────────────────────────────────
// POST /api/interviews
// Body: { type, difficulty, topics, questionCount, timePerQuestion }
// ─────────────────────────────────────────
exports.createSession = async (req, res, next) => {
  try {
    const {
      type          = 'mixed',
      difficulty    = 'mixed',
      topics        = [],
      questionCount = 5,
      timePerQuestion = 120,
    } = req.body;

    // Build filter cho random questions
    const filter = { isActive: true };

    if (type === 'technical')  filter.category = 'technical';
    if (type === 'behavioral') filter.category = { $in: ['behavioral', 'hr'] };
    // type === 'mixed' → không filter category

    if (difficulty !== 'mixed') filter.difficulty = difficulty;
    if (topics.length > 0) filter.topic = { $in: topics };

    const count = Math.min(20, Math.max(1, parseInt(questionCount)));

    const questions = await Question.aggregate([
      { $match: filter },
      { $sample: { size: count } },
      { $project: { sampleAnswer: 0, hints: 0 } },
    ]);

    if (questions.length === 0) {
      return res.status(404).json({ message: 'No questions found for the given config. Try adjusting difficulty or topics.' });
    }

    const session = await InterviewSession.create({
      user: req.user._id,
      type,
      status: 'in_progress',
      questions: questions.map((q) => q._id),
      settings: { questionCount: questions.length, difficulty, topics, timePerQuestion },
      startedAt: new Date(),
    });

    res.status(201).json({
      data: {
        ...session.toObject(),
        questions, // trả về câu hỏi đầy đủ để FE hiển thị ngay
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
// GET /api/interviews
// Query: status, page, limit
// ─────────────────────────────────────────
exports.getSessions = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const filter = { user: req.user._id };
    if (status) filter.status = status;

    const pageNum  = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip     = (pageNum - 1) * limitNum;

    const [sessions, total] = await Promise.all([
      InterviewSession.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      InterviewSession.countDocuments(filter),
    ]);

    res.json({
      data: sessions,
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
// GET /api/interviews/:id
// ─────────────────────────────────────────
exports.getSession = async (req, res, next) => {
  try {
    const session = await InterviewSession
      .findOne({ _id: req.params.id, user: req.user._id })
      .populate('questions', '-sampleAnswer -hints');

    if (!session) return res.status(404).json({ message: 'Session not found' });

    const [answers, feedbacks] = await Promise.all([
      Answer.find({ session: session._id }),
      Feedback.find({ session: session._id }),
    ]);

    res.json({ data: { ...session.toObject(), answers, feedbacks } });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
// POST /api/interviews/:id/answers
// Body: { questionId, content, duration, audioUrl, videoUrl, status }
// ─────────────────────────────────────────
exports.submitAnswer = async (req, res, next) => {
  try {
    const { questionId, content, duration = 0, audioUrl, videoUrl, status = 'submitted' } = req.body;

    if (!questionId) return res.status(400).json({ message: 'questionId is required' });

    const session = await InterviewSession.findOne({ _id: req.params.id, user: req.user._id });
    if (!session) return res.status(404).json({ message: 'Session not found' });
    if (session.status !== 'in_progress') {
      return res.status(400).json({ message: 'Session is not in progress' });
    }

    const inSession = session.questions.some((q) => q.toString() === questionId);
    if (!inSession) return res.status(400).json({ message: 'Question does not belong to this session' });

    // Upsert answer (cho phép update nếu đã submit trước đó)
    const answer = await Answer.findOneAndUpdate(
      { session: session._id, question: questionId, user: req.user._id },
      { content, duration, audioUrl, videoUrl, status, submittedAt: new Date() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // AI chấm điểm nếu có nội dung
    let feedback = null;
    if (status === 'submitted') {
      try {
        const question = await Question.findById(questionId);
        const aiResult = await gradeAnswer(question, content);

        feedback = await Feedback.findOneAndUpdate(
          { session: session._id, answer: answer._id, type: 'answer' },
          {
            user: req.user._id,
            type: 'answer',
            overallScore:  aiResult.overallScore,
            metrics:       aiResult.metrics,
            strengths:     aiResult.strengths,
            improvements:  aiResult.improvements,
            summary:       aiResult.summary,
            keywords:      aiResult.keywords,
            generatedBy:   'ai',
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
      } catch (aiErr) {
        // AI lỗi không block việc lưu answer
        console.error('[AI] Failed to grade answer:', aiErr.message);
      }
    }

    res.json({ data: { answer, feedback } });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
// PUT /api/interviews/:id/complete
// ─────────────────────────────────────────
exports.completeSession = async (req, res, next) => {
  try {
    const session = await InterviewSession
      .findOne({ _id: req.params.id, user: req.user._id })
      .populate('questions');

    if (!session) return res.status(404).json({ message: 'Session not found' });
    if (session.status !== 'in_progress') {
      return res.status(400).json({ message: 'Session is not in progress' });
    }

    const completedAt = new Date();
    const duration    = Math.round((completedAt - session.startedAt) / 1000);

    // Lấy tất cả answers + feedbacks của session
    const [answers, answerFeedbacks] = await Promise.all([
      Answer.find({ session: session._id }),
      Feedback.find({ session: session._id, type: 'answer' }),
    ]);

    // Build Q&A pairs để AI tổng kết
    const qaPairs = session.questions.map((q) => {
      const ans = answers.find((a) => a.question.toString() === q._id.toString());
      const fb  = answerFeedbacks.find((f) => ans && f.answer?.toString() === ans._id.toString());
      return {
        question:   q.content,
        category:   q.category,
        difficulty: q.difficulty,
        answer:     ans?.content ?? null,
        score:      fb?.overallScore ?? null,
      };
    });

    // AI tổng kết session
    let sessionFeedback = null;
    let overallScore    = null;

    try {
      const aiResult = await generateSessionFeedback(session.type, qaPairs);
      overallScore   = aiResult.overallScore;

      sessionFeedback = await Feedback.create({
        session:      session._id,
        user:         req.user._id,
        type:         'session',
        answer:       null,
        overallScore: aiResult.overallScore,
        metrics:      aiResult.metrics,
        strengths:    aiResult.strengths,
        improvements: aiResult.improvements,
        summary:      aiResult.summary,
        generatedBy:  'ai',
      });
    } catch (aiErr) {
      console.error('[AI] Failed to generate session feedback:', aiErr.message);
    }

    // Cập nhật session
    const updatedSession = await InterviewSession.findByIdAndUpdate(
      session._id,
      { status: 'completed', completedAt, duration, overallScore },
      { new: true }
    );

    res.json({ data: { session: updatedSession, feedback: sessionFeedback } });
  } catch (err) {
    next(err);
  }
};
