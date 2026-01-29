const Assignment = require('../models/Assignment');
const Course = require('../models/Course');

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

module.exports = {
  getAssignments,
  getAssignmentById,
  createAssignment
};
