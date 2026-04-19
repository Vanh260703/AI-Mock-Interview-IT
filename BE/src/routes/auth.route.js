const router = require('express').Router();
const ctrl = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { loginLimiter, emailLimiter } = require('../config/rateLimit');

router.post('/register', emailLimiter, ctrl.register);
router.get('/verify-email/:token', ctrl.verifyEmail);
router.post('/login', loginLimiter, ctrl.login);
router.post('/logout', authenticate, ctrl.logout);
router.post('/refresh-token', ctrl.refreshToken);
router.post('/forgot-password', emailLimiter, ctrl.forgotPassword);
router.post('/reset-password/:token', ctrl.resetPassword);
router.post('/google', ctrl.googleLogin);
router.post('/facebook', ctrl.facebookLogin);

module.exports = router;
