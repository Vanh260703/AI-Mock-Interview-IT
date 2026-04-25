const InterviewSession = require('../models/interview-session.model');
const Question         = require('../models/question.model');
const Answer           = require('../models/answer.model');
const Feedback         = require('../models/feedback.model');
const { queues }       = require('../config/bull');
const { transcribeAudio } = require('../services/ai.service');

const JOB_OPTIONS = {
  attempts:         3,
  backoff:          { type: 'exponential', delay: 5000 },
  removeOnComplete: false,
  removeOnFail:     false,
};

// level → difficulty mapping
const LEVEL_DIFFICULTY = {
  intern:  'easy',
  fresher: 'easy',
  junior:  'medium',
  middle:  'hard',
  senior:  'hard',
};

// POST /api/interviews
// Body: { type, level, role, tags, questionCount, timePerQuestion }
exports.createSession = async (req, res, next) => {
  try {
    const {
      type            = 'mixed',
      level           = null,
      role            = 'General',
      tags            = [],
      questionCount   = 5,
      timePerQuestion = 120,
    } = req.body;

    if (!level) return res.status(400).json({ message: 'level is required!' });

    const difficulty = LEVEL_DIFFICULTY[level] ?? 'medium';
    const count      = Math.min(20, Math.max(1, parseInt(questionCount)));
    const project    = { $project: { sampleAnswer: 0 } };

    let questions;

    if (type === 'behavioral') {
      // Behavioral: không lấy coding questions
      const filter = {
        isActive:   true,
        type:       { $ne: 'coding' },
        category:   { $in: ['behavioral', 'hr', 'situational'] },
        level,
      };
      if (tags.length > 0) filter.tags = { $in: tags };

      questions = await Question.aggregate([
        { $match: filter },
        { $sample: { size: count } },
        project,
      ]);
    } else {
      // mixed / technical: đảm bảo ~20% là coding questions
      const codingCount = Math.max(1, Math.ceil(count * 0.2));
      const textCount   = count - codingCount;

      // Filter cho câu hỏi thường (text)
      const textFilter = { isActive: true, type: { $ne: 'coding' }, level };
      if (type === 'technical') textFilter.category = 'technical';
      if (difficulty)           textFilter.difficulty = difficulty;
      if (tags.length > 0)      textFilter.tags = { $in: tags };
      // Role: General hoặc đúng role
      textFilter.role = role === 'General' ? 'General' : { $in: [role, 'General'] };

      // Filter cho coding questions (linh hoạt hơn về role)
      const codingFilter = { isActive: true, type: 'coding', level };
      if (tags.length > 0) codingFilter.tags = { $in: tags };
      codingFilter.role = role === 'General'
        ? { $in: ['General', 'FE', 'BE', 'FS', 'Mobile', 'DA'] }
        : { $in: [role, 'General'] };

      const [textQs, codingQs] = await Promise.all([
        Question.aggregate([{ $match: textFilter }, { $sample: { size: textCount } }, project]),
        Question.aggregate([{ $match: codingFilter }, { $sample: { size: codingCount } }, project]),
      ]);

      // Gộp lại và shuffle
      questions = [...textQs, ...codingQs].sort(() => Math.random() - 0.5);
    }

    if (questions.length === 0) {
      return res.status(404).json({ message: 'No questions found for the given config.' });
    }

    const session = await InterviewSession.create({
      user: req.user._id,
      type,
      status:    'in_progress',
      questions: questions.map((q) => q._id),
      settings:  { questionCount: questions.length, difficulty, tags, timePerQuestion, role, level },
      startedAt: new Date(),
    });

    res.status(201).json({ data: { ...session.toObject(), questions } });
  } catch (err) {
    next(err);
  }
};

// GET /api/interviews
// Query: status, page, limit
exports.getSessions = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const filter = { user: req.user._id };
    if (status) filter.status = status;

    const pageNum  = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip     = (pageNum - 1) * limitNum;

    const [sessions, total] = await Promise.all([
      InterviewSession.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
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

// GET /api/interviews/:id
exports.getSession = async (req, res, next) => {
  try {
    const session = await InterviewSession
      .findOne({ _id: req.params.id, user: req.user._id })
      .populate('questions', '-sampleAnswer');

    if (!session) return res.status(404).json({ message: 'Session not found' });

    const [answers, feedbacks] = await Promise.all([
      Answer.find({ session: session._id }),
      Feedback.find({ session: session._id }),
    ]);

    res.json({ data: { session: session.toObject(), answers, feedbacks } });
  } catch (err) {
    next(err);
  }
};

// POST /api/interviews/:id/answers
// multipart/form-data: media (file, optional) + các field JSON
// Body fields: { questionId, content, duration, audioUrl, videoUrl, status }
// Nếu có file upload (field "media"), URL từ Cloudinary sẽ override audioUrl/videoUrl
exports.submitAnswer = async (req, res, next) => {
  try {
    let { questionId, content, duration = 0, audioUrl, videoUrl, status = 'submitted' } = req.body;

    // Nếu middleware upload đã xử lý file → gán URL từ Cloudinary
    if (req.mediaUrl) {
      if (req.mediaType === 'video') videoUrl = req.mediaUrl;
      else                           audioUrl = req.mediaUrl;
    }

    // Nếu có file upload mà không có text → tự động speech-to-text
    if (req.file && !content?.trim()) {
      content = await transcribeAudio(req.file.buffer, req.file.mimetype, req.file.originalname);
    }

    if (!questionId) return res.status(400).json({ message: 'questionId is required' });

    const session = await InterviewSession.findOne({ _id: req.params.id, user: req.user._id });
    if (!session) return res.status(404).json({ message: 'Session not found' });
    if (session.status !== 'in_progress') {
      return res.status(400).json({ message: 'Session is not in progress' });
    }

    const inSession = session.questions.some((q) => q.toString() === questionId);
    if (!inSession) return res.status(400).json({ message: 'Question does not belong to this session' });

    // Upsert — cho phép user chỉnh sửa lại câu trả lời
    const answer = await Answer.findOneAndUpdate(
      { session: session._id, question: questionId, user: req.user._id },
      { content, duration, audioUrl, videoUrl, status, submittedAt: new Date() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Enqueue AI grading ngay sau khi submit (chỉ với status submitted)
    if (status === 'submitted') {
      await queues.feedbackQueue.add(
        'FeedbackJob',
        { answerId: answer._id, sessionId: session._id },
        JOB_OPTIONS
      );
    }

    res.json({ data: { answer } });
  } catch (err) {
    next(err);
  }
};

// PUT /api/interviews/:id/complete
// Chỉ đánh dấu session hoàn thành — AI feedback sẽ xử lý riêng qua /api/feedback
exports.completeSession = async (req, res, next) => {
  try {
    const session = await InterviewSession.findOne({ _id: req.params.id, user: req.user._id });
    if (!session) return res.status(404).json({ message: 'Session not found' });
    if (session.status !== 'in_progress') {
      return res.status(400).json({ message: 'Session is not in progress' });
    }

    const completedAt = new Date();
    const duration    = Math.round((completedAt - session.startedAt) / 1000);

    const updatedSession = await InterviewSession.findByIdAndUpdate(
      session._id,
      { status: 'completed', completedAt, duration },
      { new: true }
    );

    // Nếu tất cả answers đã được graded trước khi complete → trigger SessionFeedbackJob luôn
    const [submittedCount, gradedCount, existingSessionFeedback] = await Promise.all([
      Answer.countDocuments({ session: session._id, status: 'submitted' }),
      Feedback.countDocuments({ session: session._id, type: 'answer' }),
      Feedback.findOne({ session: session._id, type: 'session' }),
    ]);

    if (gradedCount >= submittedCount && submittedCount > 0 && !existingSessionFeedback) {
      await queues.feedbackQueue.add(
        'SessionFeedbackJob',
        { sessionId: session._id },
        { attempts: 3, backoff: { type: 'exponential', delay: 5000 } }
      );
    }

    res.json({ data: { session: updatedSession } });
  } catch (err) {
    next(err);
  }
};
