// Bypass tất cả rate limiters trong môi trường test
const passthrough = (_req, _res, next) => next();

module.exports = {
  generalLimiter: passthrough,
  loginLimiter:   passthrough,
  emailLimiter:   passthrough,
};
