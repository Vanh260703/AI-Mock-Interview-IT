const express = require('express');
const { authenticate } = require('../middlewares/auth.middleware');
const ctrl = require('../controllers/social.controller');

const router = express.Router();

router.use(authenticate);

router.get('/suggestions',              ctrl.getSuggestions);
router.get('/search',                   ctrl.searchUsers);
router.get('/friend-requests',          ctrl.getIncomingRequests);
router.post('/friend-requests',         ctrl.sendRequest);
router.patch('/friend-requests/:id/accept', ctrl.acceptRequest);
router.patch('/friend-requests/:id/reject', ctrl.rejectRequest);
router.get('/friends',                  ctrl.getFriends);
router.delete('/friends/:userId',       ctrl.unfriend);

module.exports = router;
