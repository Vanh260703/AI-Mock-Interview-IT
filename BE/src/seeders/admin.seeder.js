const User = require('../models/user.model');

const seedAdmin = async () => {
  try {
    const exists = await User.findOne({ username: 'admin' });
    if (exists) return;

    await User.create({
      username: 'admin',
      email: 'admin@aimock.local',
      password: 'admin@123',
      role: 'admin',
      isEmailVerified: true,
    });

    console.log('[Seeder] Admin created — username: admin | password: admin@123');
  } catch (err) {
    console.error('[Seeder] Failed to seed admin:', err.message);
  }
};

module.exports = seedAdmin;
