const { queues }        = require('../config/bull');
const Answer            = require('../models/answer.model');
const Question          = require('../models/question.model');
const Feedback          = require('../models/feedback.model');
const InterviewSession  = require('../models/interview-session.model');
const { gradeAnswer, generateSessionFeedback } = require('../services/ai.service');

const { feedbackQueue } = queues;

// ─────────────────────────────────────────
// Job: FeedbackJob
// Data: { answerId, sessionId }
// Gọi AI chấm 1 answer → lưu Feedback
// Sau đó kiểm tra nếu tất cả answer đã chấm → enqueue SessionFeedbackJob
// ─────────────────────────────────────────
feedbackQueue.process('FeedbackJob', 2, async (job) => {
  const { answerId, sessionId } = job.data;

  const answer = await Answer.findById(answerId);
  if (!answer) throw new Error(`Answer ${answerId} not found`);

  const question = await Question.findById(answer.question);
  if (!question) throw new Error(`Question not found for answer ${answerId}`);

  // Gọi AI
  const aiResult = await gradeAnswer(question, answer.content);

  // Upsert Feedback cho answer này
  await Feedback.findOneAndUpdate(
    { session: sessionId, answer: answerId, type: 'answer' },
    {
      user:         answer.user,
      type:         'answer',
      overallScore: aiResult.overallScore,
      metrics:      aiResult.metrics,
      strengths:    aiResult.strengths,
      improvements: aiResult.improvements,
      summary:      aiResult.summary,
      keywords:     aiResult.keywords,
      generatedBy:  'ai',
    },
    { upsert: true, new: true }
  );

  console.log(`[FeedbackJob] Answer ${answerId} graded — score: ${aiResult.overallScore}`);

  // Chỉ trigger SessionFeedbackJob khi session đã completed VÀ tất cả answers đã graded
  const [session, submittedAnswers, gradedFeedbacks] = await Promise.all([
    InterviewSession.findById(sessionId, 'status'),
    Answer.countDocuments({ session: sessionId, status: 'submitted' }),
    Feedback.countDocuments({ session: sessionId, type: 'answer' }),
  ]);

  if (session?.status === 'completed' && gradedFeedbacks >= submittedAnswers) {
    const existing = await Feedback.findOne({ session: sessionId, type: 'session' });
    if (!existing) {
      await feedbackQueue.add(
        'SessionFeedbackJob',
        { sessionId },
        { attempts: 3, backoff: { type: 'exponential', delay: 5000 } }
      );
      console.log(`[FeedbackJob] All answers graded — SessionFeedbackJob enqueued for session ${sessionId}`);
    }
  }

  return { answerId, score: aiResult.overallScore };
});

// ─────────────────────────────────────────
// Job: SessionFeedbackJob
// Data: { sessionId }
// Tổng kết toàn bộ session → lưu Feedback type='session' + cập nhật overallScore
// ─────────────────────────────────────────
feedbackQueue.process('SessionFeedbackJob', 1, async (job) => {
  const { sessionId } = job.data;

  // Idempotent: nếu đã có session feedback thì bỏ qua
  const alreadyDone = await Feedback.findOne({ session: sessionId, type: 'session' });
  if (alreadyDone) {
    console.log(`[SessionFeedbackJob] Session ${sessionId} already has feedback. Skipping.`);
    return { skipped: true };
  }

  const session = await InterviewSession.findById(sessionId).populate('questions');
  if (!session) throw new Error(`Session ${sessionId} not found`);

  const [answers, answerFeedbacks] = await Promise.all([
    Answer.find({ session: sessionId }),
    Feedback.find({ session: sessionId, type: 'answer' }),
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

  // Gọi AI
  const aiResult = await generateSessionFeedback(session.type, qaPairs);

  // Lưu session feedback
  await Feedback.create({
    session:      sessionId,
    user:         session.user,
    type:         'session',
    answer:       null,
    overallScore: aiResult.overallScore,
    metrics:      aiResult.metrics,
    strengths:    aiResult.strengths,
    improvements: aiResult.improvements,
    summary:      aiResult.summary,
    generatedBy:  'ai',
  });

  // Cập nhật overallScore trên session
  await InterviewSession.findByIdAndUpdate(sessionId, { overallScore: aiResult.overallScore });

  console.log(`[SessionFeedbackJob] Session ${sessionId} feedback saved — score: ${aiResult.overallScore}`);

  return { sessionId, overallScore: aiResult.overallScore };
});

console.log('[Worker] feedback.worker loaded — processing FeedbackJob & SessionFeedbackJob');
