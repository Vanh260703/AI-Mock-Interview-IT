const jwt  = require('jsonwebtoken');
const User = require('../../src/models/user.model');

/**
 * Tạo user trong DB và trả về JWT (bypass email verification)
 */
const createAuthUser = async (overrides = {}) => {
  const ts   = Date.now();
  const user = await User.create({
    username:        `user_${ts}`,
    email:           `user_${ts}@test.com`,
    password:        'Test@123456',
    isEmailVerified: true,
    role:            'user',
    ...overrides,
  });

  // Payload phải khớp với authenticate middleware (decoded.id)
  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '1h' }
  );

  return { user, token };
};

module.exports = { createAuthUser };
