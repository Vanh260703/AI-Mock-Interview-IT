const router = require('express').Router();
const ctrl = require('../controllers/question.controller');
const { authenticate } = require('../middlewares/auth.middleware');

// /random và /categories phải đứng trước /:id để không bị match nhầm
router.get('/random',     authenticate, ctrl.getRandomQuestions);
router.get('/categories', authenticate, ctrl.getCategories);
router.get('/',           authenticate, ctrl.getQuestions);
router.get('/:id',        authenticate, ctrl.getQuestionById);

module.exports = router;
