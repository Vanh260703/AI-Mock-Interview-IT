const Question = require('../models/question.model');

// GET /api/questions
// Query: category, difficulty, topic, tags, page, limit
exports.getQuestions = async (req, res, next) => {
  try {
    const { category, difficulty, topic, tags, role, level, page = 1, limit = 10 } = req.query;

    const filter = { isActive: true };
    if (category)   filter.category   = category;
    if (difficulty) filter.difficulty = difficulty;
    if (topic)      filter.topic      = { $regex: topic, $options: 'i' };
    if (tags)       filter.tags       = { $in: tags.split(',').map((t) => t.trim()) };
    if (role)       filter.role       = role;
    if (level)      filter.level      = level;

    const pageNum  = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip     = (pageNum - 1) * limitNum;

    const [questions, total] = await Promise.all([
      Question.find(filter)
        .select('-sampleAnswer -hints')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Question.countDocuments(filter),
    ]);

    res.json({
      data: questions,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/questions/random
// Query: category, difficulty, topic, limit, page
exports.getRandomQuestions = async (req, res, next) => {
  try {
    const { category, difficulty, topic, role, level, page = 1, limit = 10 } = req.query;

    const filter = { isActive: true };
    if (category)   filter.category   = category;
    if (difficulty) filter.difficulty = difficulty;
    if (topic)      filter.topic      = { $regex: topic, $options: 'i' };
    if (role)       filter.role       = role;
    if (level)      filter.level      = level;

    const pageNum  = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip     = (pageNum - 1) * limitNum;

    const [questions, total] = await Promise.all([
      Question.aggregate([
        { $match: filter },
        { $sample: { size: skip + limitNum } },   // lấy dư để paginate
        { $skip: skip },
        { $limit: limitNum },
        { $project: { sampleAnswer: 0, hints: 0 } },
      ]),
      Question.countDocuments(filter),
    ]);

    res.json({
      data: questions,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/questions/categories
// Trả về danh sách categories kèm số lượng question và breakdown theo difficulty
exports.getCategories = async (_req, res, next) => {
  try {
    const stats = await Question.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: { category: '$category', difficulty: '$difficulty' },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: '$_id.category',
          total: { $sum: '$count' },
          difficulties: {
            $push: { difficulty: '$_id.difficulty', count: '$count' },
          },
        },
      },
      { $sort: { total: -1 } },
    ]);

    const data = stats.map(({ _id, total, difficulties }) => ({
      category: _id,
      total,
      difficulties: difficulties.reduce((acc, d) => {
        acc[d.difficulty] = d.count;
        return acc;
      }, {}),
    }));

    res.json({ data });
  } catch (err) {
    next(err);
  }
};

// GET /api/questions/:id
exports.getQuestionById = async (req, res, next) => {
  try {
    const question = await Question.findOne({ _id: req.params.id, isActive: true });
    if (!question) return res.status(404).json({ message: 'Question not found' });
    res.json({ data: question });
  } catch (err) {
    next(err);
  }
};
