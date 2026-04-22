const express = require('express');
const { getMyStats, getMyProgress, updateProfile, updateAvatar } = require('../controllers/user.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { uploadAvatar }  = require('../middlewares/upload.middleware');

const router = express.Router();

router.use(authenticate);

router.get('/me/stats',      getMyStats);
router.get('/me/progress',   getMyProgress);
router.patch('/me',          updateProfile);
router.patch('/me/avatar',   uploadAvatar, updateAvatar);

module.exports = router;
