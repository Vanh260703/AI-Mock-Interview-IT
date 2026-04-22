const express = require('express');
const { getMyStats, getMyProgress } = require('../controllers/user.controller');
const { authenticate } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(authenticate);

router.get('/me/stats',    getMyStats);
router.get('/me/progress', getMyProgress);

module.exports = router;
