const InterviewSession = require('../models/interview-session.model');
const Answer           = require('../models/answer.model');
const Feedback         = require('../models/feedback.model');
const { queues }       = require('../config/bull');

const JOB_OPTIONS = {
  attempts:          3,
  backoff:           { type: 'exponential', delay: 5000 },
  removeOnComplete:  false,
  removeOnFail:      false,
};

// POST /api/feedback/session/:sessionId
// Enqueue FeedbackJob cho mỗi answer trong session
exports.requestFeedback = async (req, res, next) => {
  try {
    const session = await InterviewSession.findOne({
      _id:  req.params.sessionId,
      user: req.user._id,
    });
    if (!session) return res.status(404).json({ message: 'Session not found' });
    if (session.status !== 'completed') {
      return res.status(400).json({ message: 'Session must be completed before requesting feedback' });
    }

    // Tránh enqueue lại nếu đã có session feedback
    const existingSessionFeedback = await Feedback.findOne({ session: session._id, type: 'session' });
    if (existingSessionFeedback) {
      return res.status(409).json({ message: 'Feedback already generated for this session.' });
    }

    const answers = await Answer.find({ session: session._id, status: 'submitted' });
    if (answers.length === 0) {
      return res.status(400).json({ message: 'No submitted answers found in this session' });
    }

    // Enqueue FeedbackJob cho từng answer
    const jobs = await Promise.all(
      answers.map((answer) =>
        queues.feedbackQueue.add(
          'FeedbackJob',
          { answerId: answer._id, sessionId: session._id },
          JOB_OPTIONS
        )
      )
    );

    res.status(202).json({
      message:   'Feedback generation started. Poll GET /api/feedback/session/:sessionId to check results.',
      jobCount:  jobs.length,
      sessionId: session._id,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/feedback/session/:sessionId
// Trả về kết quả feedback (answer feedbacks + session feedback)
exports.getSessionFeedback = async (req, res, next) => {
  try {
    const session = await InterviewSession.findOne({
      _id:  req.params.sessionId,
      user: req.user._id,
    });
    if (!session) return res.status(404).json({ message: 'Session not found' });

    const feedbacks = await Feedback.find({ session: session._id })
      .populate({
        path: 'answer',
        select: 'content duration status question',
        populate: { path: 'question', select: 'content type difficulty topic tags' },
      })
      .sort({ createdAt: 1 });

    const answerFeedbacks  = feedbacks.filter((f) => f.type === 'answer');
    const sessionFeedback  = feedbacks.find((f) => f.type === 'session') ?? null;

    const totalAnswers  = await Answer.countDocuments({ session: session._id, status: 'submitted' });
    const gradedAnswers = answerFeedbacks.length;

    // Nếu session đã completed và không có câu nào được submit (tất cả skip)
    // → coi như hoàn tất, không cần chờ AI
    const allSkipped   = session.status === 'completed' && totalAnswers === 0;
    const isComplete   = allSkipped || !!sessionFeedback;

    res.json({
      data: {
        session: {
          _id:          session._id,
          status:       session.status,
          overallScore: session.overallScore,
        },
        progress: {
          total:      totalAnswers,
          graded:     gradedAnswers,
          isComplete,
          allSkipped,
        },
        answerFeedbacks,
        sessionFeedback,
      },
    });
  } catch (err) {
    next(err);
  }
};
