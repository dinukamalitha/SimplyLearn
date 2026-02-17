const mongoose = require("mongoose");
const sanitizeHtml = require("sanitize-html");
const Quiz = require("./Quiz");
const QuizResult = require("./QuizResult");
const Course = require("../courses/Course");
const Enrollment = require("../engagement/Enrollment");

// -----------------------------------------------------

const getQuizzes = async (req, res) => {
  try {
    const { courseId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ message: "Invalid course id" });
    }

    const safeCourseId = new mongoose.Types.ObjectId(courseId);

    const quizzes = await Quiz.find({
      course_id: safeCourseId,
    });

    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// -----------------------------------------------------

const getQuizById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid quiz id" });
    }

    if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const safeQuizId = new mongoose.Types.ObjectId(id);
    const safeUserId = new mongoose.Types.ObjectId(req.user.id);

    const quiz = await Quiz.findById(safeQuizId)
      .populate("course_id", "title")
      .lean();

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    if (req.user.role === "Student") {
      const enrollment = await Enrollment.findOne({
        student_id: safeUserId,
        course_id: quiz.course_id._id,
      });

      if (!enrollment) {
        return res.status(403).json({
          message:
            "Not authorized. You must be enrolled in this course to access the quiz.",
        });
      }
    }

    const sanitizedQuiz = {
      ...quiz,
      questions: quiz.questions.map(
        ({ correct_option_index, correct_answer, ...q }) => q
      ),
    };

    res.json(sanitizedQuiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// -----------------------------------------------------

const createQuiz = async (req, res) => {
  try {
    const { course_id, title, questions, timer_limit } = req.body;

    if (!mongoose.Types.ObjectId.isValid(course_id)) {
      return res.status(400).json({ message: "Invalid course id" });
    }

    if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const safeCourseId = new mongoose.Types.ObjectId(course_id);
    const safeUserId = new mongoose.Types.ObjectId(req.user.id);

    const course = await Course.findById(safeCourseId);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (
      course.tutor_id.toString() !== safeUserId.toString() &&
      req.user.role !== "Admin"
    ) {
      return res.status(403).json({
        message:
          "Not authorized to create quiz for this course. You must be the course tutor or admin.",
      });
    }

    if (typeof title !== "string" || !title.trim()) {
      return res.status(400).json({ message: "Invalid quiz title" });
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return res
        .status(400)
        .json({ message: "Questions must be a non-empty array" });
    }

    if (timer_limit !== undefined && !Number.isFinite(timer_limit)) {
      return res.status(400).json({ message: "Invalid timer limit" });
    }

    const safeTitle = sanitizeHtml(title, {
      allowedTags: [],
      allowedAttributes: {},
    }).trim();

    if (safeTitle.length > 200) {
      return res
        .status(400)
        .json({ message: "Title too long (max 200 characters)" });
    }

    const sanitizedQuestions = questions.map((q) => ({
      question_text:
        typeof q.question_text === "string"
          ? sanitizeHtml(q.question_text, {
              allowedTags: [],
              allowedAttributes: {},
            }).trim()
          : "",
      options: Array.isArray(q.options)
        ? q.options.map((opt) =>
            sanitizeHtml(String(opt), {
              allowedTags: [],
              allowedAttributes: {},
            }).trim()
          )
        : [],
      correct_option_index:
        Number.isInteger(q.correct_option_index) &&
        q.correct_option_index >= 0
          ? q.correct_option_index
          : 0,
      correct_answer:
        typeof q.correct_answer === "string"
          ? sanitizeHtml(q.correct_answer, {
              allowedTags: [],
              allowedAttributes: {},
            }).trim()
          : "",
    }));

    const quiz = await Quiz.create({
      course_id: safeCourseId,
      title: safeTitle,
      questions: sanitizedQuestions,
      timer_limit,
    });

    res.status(201).json(quiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// -----------------------------------------------------

const submitQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const { answers } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid quiz id" });
    }

    if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    if (!answers || typeof answers !== "object") {
      return res.status(400).json({ message: "Invalid answers format" });
    }

    const safeQuizId = new mongoose.Types.ObjectId(id);
    const safeStudentId = new mongoose.Types.ObjectId(req.user.id);

    const quiz = await Quiz.findById(safeQuizId);

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    if (req.user.role === "Student") {
      const enrollment = await Enrollment.findOne({
        student_id: safeStudentId,
        course_id: quiz.course_id,
      });

      if (!enrollment) {
        return res.status(403).json({
          message:
            "Not authorized. You must be enrolled in this course to take the quiz.",
        });
      }
    }

    let score = 0;

    quiz.questions.forEach((question, index) => {
      const studentAnswer = answers[index];
      if (
        studentAnswer !== undefined &&
        studentAnswer === question.correct_option_index
      ) {
        score++;
      }
    });

    const totalQuestions = quiz.questions.length;
    const percentage = (score / totalQuestions) * 100;

    const result = await QuizResult.create({
      quiz_id: safeQuizId,
      student_id: safeStudentId,
      answers: new Map(Object.entries(answers)),
      score,
      total_questions: totalQuestions,
      percentage,
      submitted_at: new Date(),
    });

    res.json({
      score,
      total: totalQuestions,
      percentage: Math.round(percentage * 100) / 100,
      submitted_at: result.submitted_at,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// -----------------------------------------------------

const getQuizResults = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid quiz id" });
    }

    if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const safeQuizId = new mongoose.Types.ObjectId(id);
    const safeUserId = new mongoose.Types.ObjectId(req.user.id);

    const query =
      req.user.role === "Student"
        ? {
            quiz_id: safeQuizId,
            student_id: safeUserId,
          }
        : {
            quiz_id: safeQuizId,
          };

    const results = await QuizResult.find(query)
      .populate("student_id", "name email")
      .sort({ submitted_at: -1 });

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// -----------------------------------------------------

module.exports = {
  getQuizzes,
  getQuizById,
  createQuiz,
  submitQuiz,
  getQuizResults,
};