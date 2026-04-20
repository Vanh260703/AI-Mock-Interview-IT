const router = require('express').Router();
const { authenticate } = require('../middlewares/auth.middleware');
const ctrl = require('../controllers/ai.controller');

router.post('/test', authenticate, ctrl.testAI);

module.exports = router;
