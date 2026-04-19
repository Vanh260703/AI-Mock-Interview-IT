const rateLimit = require('express-rate-limit');

// General: áp dụng toàn bộ API
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' },
});

// Login: chống brute force
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many login attempts, please try again after 15 minutes.' },
});

// Các endpoint gửi email (register, forgot-password)
const emailLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 giờ
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many email requests, please try again after 1 hour.' },
});

module.exports = { generalLimiter, loginLimiter, emailLimiter };
