const router = require('express').Router();
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const ctrl = require('../controllers/admin.controller');

router.use(authenticate, authorize('admin'));

router.get('/users', ctrl.getUsers);
router.get('/system', ctrl.getSystemStats);

module.exports = router;
