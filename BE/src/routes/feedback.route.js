const router = require('express').Router();
const { authenticate } = require('../middlewares/auth.middleware');
const ctrl = require('../controllers/feedback.controller');

router.use(authenticate);

router.post('/session/:sessionId', ctrl.requestFeedback);
router.get('/session/:sessionId',  ctrl.getSessionFeedback);

module.exports = router;
