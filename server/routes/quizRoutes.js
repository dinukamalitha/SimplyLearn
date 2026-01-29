const express = require('express');
const router = express.Router();
const { getQuizzes, getQuizById, createQuiz } = require('../controllers/quizController');
const { protect } = require('../middleware/authMiddleware');

router.get('/course/:courseId', protect, getQuizzes);
router.get('/:id', protect, getQuizById);
router.post('/', protect, createQuiz);

module.exports = router;
