const Assignment = require('../models/Assignment');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Submission = require('../models/Submission');

// @desc    Get assignments for a course
// @route   GET /api/assignments/course/:courseId
// @access  Private
const getAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find({ course_id: req.params.courseId });
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
    const assignment = await Assignment.findById(req.params.id);
    if (assignment) {
      res.json(assignment);
    } else {
      res.status(404).json({ message: 'Assignment not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create assignment
// @route   POST /api/assignments
// @access  Private (Tutor)
const createAssignment = async (req, res) => {
  const { course_id, title, instructions, deadline, max_points } = req.body;

  try {
    const course = await Course.findById(course_id);
    if (!course) {
        return res.status(404).json({ message: 'Course not found' });
    }

    if (course.tutor_id.toString() !== req.user.id && req.user.role !== 'Admin') {
        return res.status(403).json({ message: 'Not authorized to add assignments to this course' });
    }

    const assignment = await Assignment.create({
      course_id,
      title,
      instructions,
      deadline,
      max_points
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
    console.log('Fetching student assignments for:', req.user._id);
    const enrollments = await Enrollment.find({ student_id: req.user._id });
    const courseIds = enrollments.map(e => e.course_id);
    console.log('Student course IDs:', courseIds);

    const assignments = await Assignment.find({ course_id: { $in: courseIds } })
      .populate('course_id', 'title')
      .sort({ deadline: 1 });

    // For each assignment, check if there's a submission
    const assignmentsWithStatus = await Promise.all(assignments.map(async (assignment) => {
        const submission = await Submission.findOne({ 
            assignment_id: assignment._id, 
            student_id: req.user._id 
        });
        return {
            ...assignment.toObject(),
            submission: submission ? {
                submission_date: submission.submission_date,
                grade: submission.grade
            } : null
        };
    }));

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
    console.log('Fetching tutor assignments for:', req.user._id);
    const courses = await Course.find({ tutor_id: req.user._id });
    const courseIds = courses.map(c => c._id);
    console.log('Tutor course IDs:', courseIds);

    const assignments = await Assignment.find({ course_id: { $in: courseIds } })
      .populate('course_id', 'title')
      .sort({ deadline: 1 });

    const assignmentsWithStats = await Promise.all(assignments.map(async (assignment) => {
        const totalSubmissions = await Submission.countDocuments({ assignment_id: assignment._id });
        const gradedSubmissions = await Submission.countDocuments({ 
            assignment_id: assignment._id, 
            grade: { $ne: null } 
        });

        return {
            ...assignment.toObject(),
            submissionStats: {
                total: totalSubmissions,
                pending: totalSubmissions - gradedSubmissions
            }
        };
    }));

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
  getTutorAssignments
};
