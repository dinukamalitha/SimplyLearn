const mongoose = require("mongoose");
const Assignment = require("./Assignment");
const Course = require("../courses/Course");
const Enrollment = require("../engagement/Enrollment");
const Submission = require("./Submission");

// @desc    Get assignments for a course
// @route   GET /api/assignments/course/:courseId
// @access  Private
const getAssignments = async (req, res) => {
  try {
    const { courseId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ message: "Invalid course id" });
    }

    const safeCourseId = new mongoose.Types.ObjectId(courseId);

    const assignments = await Assignment.find({
      course_id: safeCourseId,
    });

    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single assignment
// @route   GET /api/assignments/:id
// @access  Private
const getAssignmentById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid assignment id" });
    }

    const safeId = new mongoose.Types.ObjectId(id);

    const assignment = await Assignment.findById(safeId);

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    res.json(assignment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create assignment
// @route   POST /api/assignments
// @access  Private (Tutor)
const createAssignment = async (req, res) => {
  try {
    const { course_id, title, instructions, deadline, max_points } = req.body;

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
        message: "Not authorized to add assignments to this course",
      });
    }

    const safeTitle = typeof title === "string" ? title.trim() : "";
    const safeInstructions =
      typeof instructions === "string" ? instructions.trim() : "";

    const safeDeadline =
      deadline && !isNaN(Date.parse(deadline))
        ? new Date(deadline)
        : null;

    const safeMaxPoints =
      Number.isFinite(max_points) && max_points >= 0
        ? max_points
        : 0;

    if (!safeTitle) {
      return res.status(400).json({ message: "Title is required" });
    }

    const assignment = await Assignment.create({
      course_id: safeCourseId,
      title: safeTitle,
      instructions: safeInstructions,
      deadline: safeDeadline,
      max_points: safeMaxPoints,
    });

    res.status(201).json(assignment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all assignments for courses a student is enrolled in
// @route   GET /api/assignments/student/my
// @access  Private (Student)
const getStudentAssignments = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.user._id)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const safeStudentId = new mongoose.Types.ObjectId(req.user._id);

    const enrollments = await Enrollment.find({
      student_id: safeStudentId,
    });

    const courseIds = enrollments.map((e) => e.course_id);

    const assignments = await Assignment.find({
      course_id: { $in: courseIds },
    })
      .populate("course_id", "title")
      .sort({ deadline: 1 });

    const assignmentsWithStatus = await Promise.all(
      assignments.map(async (assignment) => {
        const submission = await Submission.findOne({
          assignment_id: assignment._id,
          student_id: safeStudentId,
        });

        return {
          ...assignment.toObject(),
          submission: submission
            ? {
                submission_date: submission.submission_date,
                grade: submission.grade,
              }
            : null,
        };
      }),
    );

    res.json(assignmentsWithStatus);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all assignments created by a tutor
// @route   GET /api/assignments/tutor/my
// @access  Private (Tutor)
const getTutorAssignments = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.user._id)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const safeTutorId = new mongoose.Types.ObjectId(req.user._id);

    const courses = await Course.find({
      tutor_id: safeTutorId,
    });

    const courseIds = courses.map((c) => c._id);

    const assignments = await Assignment.find({
      course_id: { $in: courseIds },
    })
      .populate("course_id", "title")
      .sort({ deadline: 1 });

    const assignmentsWithStats = await Promise.all(
      assignments.map(async (assignment) => {
        const totalSubmissions = await Submission.countDocuments({
          assignment_id: assignment._id,
        });

        const gradedSubmissions = await Submission.countDocuments({
          assignment_id: assignment._id,
          grade: { $ne: null },
        });

        return {
          ...assignment.toObject(),
          submissionStats: {
            total: totalSubmissions,
            pending: totalSubmissions - gradedSubmissions,
          },
        };
      }),
    );

    res.json(assignmentsWithStats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAssignments,
  getAssignmentById,
  createAssignment,
  getStudentAssignments,
  getTutorAssignments,
};