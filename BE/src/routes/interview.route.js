const router = require('express').Router();
const { authenticate }  = require('../middlewares/auth.middleware');
const { uploadMedia }   = require('../middlewares/upload.middleware');
const ctrl = require('../controllers/interview.controller');

router.use(authenticate);

router.post('/',                              ctrl.createSession);
router.get('/',                               ctrl.getSessions);
router.get('/:id',                            ctrl.getSession);
router.post('/:id/answers', uploadMedia,      ctrl.submitAnswer);
router.put('/:id/complete',                   ctrl.completeSession);

module.exports = router;
