const os = require('os');
const User = require('../models/user.model');

// GET /api/admin/users
exports.getUsers = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find()
        .select('-password -emailVerificationToken -emailVerificationExpires -resetPasswordToken -resetPasswordExpires')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(),
    ]);

    res.json({
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/system
exports.getSystemStats = (_req, res) => {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;

  const cpus = os.cpus();
  const cpuDetails = cpus.map((cpu) => {
    const total = Object.values(cpu.times).reduce((a, b) => a + b, 0);
    const used = total - cpu.times.idle;
    return {
      model: cpu.model,
      usagePercent: Number(((used / total) * 100).toFixed(2)),
    };
  });

  res.json({
    memory: {
      totalBytes: totalMem,
      usedBytes: usedMem,
      freeBytes: freeMem,
      usedPercent: Number(((usedMem / totalMem) * 100).toFixed(2)),
    },
    cpu: {
      cores: cpus.length,
      model: cpus[0]?.model || 'unknown',
      details: cpuDetails,
    },
    uptime: os.uptime(),
    platform: os.platform(),
    hostname: os.hostname(),
  });
};
