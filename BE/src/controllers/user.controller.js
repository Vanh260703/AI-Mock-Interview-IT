const mongoose = require('mongoose');
const InterviewSession = require('../models/interview-session.model');
const Answer           = require('../models/answer.model');

// ─── Helper: tính streak (ngày liên tiếp có session) ──────────────────────────
const calcStreak = (sortedDateStrings) => {
  if (!sortedDateStrings.length) return 0;

  const today     = new Date();
  const todayStr  = today.toISOString().slice(0, 10);
  const dateSet   = new Set(sortedDateStrings);

  // Streak bắt đầu từ hôm nay hoặc hôm qua (nếu chưa làm hôm nay)
  const startDate = dateSet.has(todayStr) ? new Date(todayStr) : (() => {
    const y = new Date(today);
    y.setDate(y.getDate() - 1);
    const s = y.toISOString().slice(0, 10);
    return dateSet.has(s) ? new Date(s) : null;
  })();

  if (!startDate) return 0;

  let streak = 0;
  const cursor = new Date(startDate);

  while (true) {
    const s = cursor.toISOString().slice(0, 10);
    if (!dateSet.has(s)) break;
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
};

// ─── GET /api/users/me/stats ───────────────────────────────────────────────────
exports.getMyStats = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);

    const [sessionStats, totalAnswers, sessionDates, roleStats, levelStats] = await Promise.all([
      // Thống kê tổng quan sessions
      InterviewSession.aggregate([
        { $match: { user: userId, status: 'completed' } },
        {
          $group: {
            _id:           null,
            totalSessions: { $sum: 1 },
            avgScore:      { $avg: '$overallScore' },
            bestScore:     { $max: '$overallScore' },
            totalDuration: { $sum: '$duration' },
          },
        },
      ]),

      // Tổng số câu trả lời đã submit
      Answer.countDocuments({ user: userId, status: 'submitted' }),

      // Ngày có completed session để tính streak
      InterviewSession.aggregate([
        { $match: { user: userId, status: 'completed', completedAt: { $ne: null } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$completedAt' } },
          },
        },
        { $sort: { _id: -1 } },
      ]),

      // Role được luyện tập nhiều nhất
      InterviewSession.aggregate([
        { $match: { user: userId, status: 'completed', 'settings.role': { $ne: null } } },
        { $group: { _id: '$settings.role', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 1 },
      ]),

      // Level được luyện tập nhiều nhất
      InterviewSession.aggregate([
        { $match: { user: userId, status: 'completed', 'settings.level': { $ne: null } } },
        { $group: { _id: '$settings.level', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 1 },
      ]),
    ]);

    const s             = sessionStats[0] ?? {};
    const totalSessions = s.totalSessions ?? 0;
    const avgScore      = s.avgScore      != null ? Math.round(s.avgScore * 10) / 10 : null;
    const bestScore     = s.bestScore     ?? null;
    const totalDuration = s.totalDuration ?? 0; // giây

    const dateSeries = sessionDates.map((d) => d._id);
    const streak     = calcStreak(dateSeries);

    // Tổng số sessions (bao gồm chưa completed) để tính completion rate
    const totalAllSessions = await InterviewSession.countDocuments({ user: userId });
    const completionRate   = totalAllSessions > 0
      ? Math.round((totalSessions / totalAllSessions) * 100)
      : 0;

    res.json({
      data: {
        totalSessions,
        totalAnswers,
        avgScore,
        bestScore,
        streak,                          // ngày liên tiếp
        completionRate,                  // % sessions completed
        totalDuration,                   // tổng giây đã luyện
        favoriteRole:  roleStats[0]?._id  ?? null,
        favoriteLevel: levelStats[0]?._id ?? null,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/users/me/progress ───────────────────────────────────────────────
// Điểm số theo ngày trong 30 ngày gần nhất
exports.getMyProgress = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);

    const days = parseInt(req.query.days) || 30;
    const limit = Math.min(90, Math.max(7, days)); // 7–90 ngày

    const since = new Date();
    since.setDate(since.getDate() - limit);
    since.setHours(0, 0, 0, 0);

    const progress = await InterviewSession.aggregate([
      {
        $match: {
          user:        userId,
          status:      'completed',
          completedAt: { $gte: since },
        },
      },
      {
        $group: {
          _id:          { $dateToString: { format: '%Y-%m-%d', date: '$completedAt' } },
          avgScore:     { $avg: '$overallScore' },
          bestScore:    { $max: '$overallScore' },
          sessionCount: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id:          0,
          date:         '$_id',
          avgScore:     { $round: ['$avgScore', 1] },
          bestScore:    1,
          sessionCount: 1,
        },
      },
    ]);

    res.json({
      data: {
        days:     limit,
        since:    since.toISOString().slice(0, 10),
        progress, // mảng { date, avgScore, bestScore, sessionCount }
      },
    });
  } catch (err) {
    next(err);
  }
};
