const Quiz = require('./Quiz');
const Course = require('../courses/Course');

const getQuizzes = async (req, res) => {
    try {
        const quizzes = await Quiz.find({ course_id: req.params.courseId });
        res.json(quizzes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getQuizById = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);
        if (quiz) res.json(quiz);
        else res.status(404).json({ message: 'Quiz not found' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createQuiz = async (req, res) => {
    const { course_id, title, questions, timer_limit } = req.body;
    try {
        const quiz = await Quiz.create({ course_id, title, questions, timer_limit });
        res.status(201).json(quiz);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getQuizzes, getQuizById, createQuiz };
