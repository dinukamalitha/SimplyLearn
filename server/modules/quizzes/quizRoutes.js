const express = require('express');
const router = express.Router();
const { getQuizzes, getQuizById, createQuiz, submitQuiz, getQuizResults } = require('./quizController');
const { protect } = require('../../middleware/authMiddleware');

router.get('/course/:courseId', protect, getQuizzes);
router.get('/:id', protect, getQuizById);
router.post('/', protect, createQuiz);
router.post('/:id/submit', protect, submitQuiz);
router.get('/:id/results', protect, getQuizResults);

module.exports = router;
