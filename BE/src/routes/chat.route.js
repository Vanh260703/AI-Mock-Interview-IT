const express    = require('express');
const router     = express.Router();
const { authenticate } = require('../middlewares/auth.middleware');
const ctrl       = require('../controllers/chat.controller');

router.use(authenticate);

router.post('/conversations',               ctrl.getOrCreate);
router.get('/conversations',                ctrl.getConversations);
router.get('/conversations/:id/messages',   ctrl.getMessages);
router.post('/conversations/:id/messages',  ctrl.sendMessage);
router.patch('/conversations/:id/read',     ctrl.markRead);

module.exports = router;
