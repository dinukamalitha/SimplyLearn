const Quiz = require('./Quiz');
const Course = require('../courses/Course');


const getQuizzes = async (req, res) => {
  try {
    const { courseId } = req.params;

    // Validate courseId
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ message: "Invalid course id" });
    }
    const safeCourseId = new mongoose.Types.ObjectId(courseId);

    const quizzes = await Quiz.find({ course_id: safeCourseId });
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getQuizById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate quiz id
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid quiz id" });
    }
    const safeQuizId = new mongoose.Types.ObjectId(id);

    const quiz = await Quiz.findById(safeQuizId);
    if (quiz) res.json(quiz);
    else res.status(404).json({ message: "Quiz not found" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createQuiz = async (req, res) => {
  const { course_id, title, questions, timer_limit } = req.body;

  try {
    // Validate course_id
    if (!mongoose.Types.ObjectId.isValid(course_id)) {
      return res.status(400).json({ message: "Invalid course id" });
    }
    const safeCourseId = new mongoose.Types.ObjectId(course_id);

    // Validate other fields
    if (typeof title !== "string" || title.trim() === "") {
      return res.status(400).json({ message: "Invalid quiz title" });
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: "Questions must be a non-empty array" });
    }

    if (timer_limit !== undefined && typeof timer_limit !== "number") {
      return res.status(400).json({ message: "Invalid timer limit" });
    }

    // Trim title for safety
    const safeTitle = title.trim();

    // Create quiz using trusted values
    const quiz = await Quiz.create({
      course_id: safeCourseId,
      title: safeTitle,
      questions,
      timer_limit
    });

    res.status(201).json(quiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getQuizzes, getQuizById, createQuiz };
