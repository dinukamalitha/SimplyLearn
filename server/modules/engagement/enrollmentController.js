const Enrollment = require('./Enrollment');
const Course = require('../courses/Course');

// @desc    Enroll in a course
// @route   POST /api/enrollments
// @access  Private (Student)
const enrollCourse = async (req, res) => {
    const { course_id } = req.body;
    try {
        // Validate user-controlled IDs
        if (!mongoose.Types.ObjectId.isValid(course_id)) {
            return res.status(400).json({ message: "Invalid course id" });
        }

        if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
            return res.status(400).json({ message: "Invalid user id" });
        }

        const safeCourseId  = new mongoose.Types.ObjectId(course_id);
        const safeStudentId = new mongoose.Types.ObjectId(req.user.id);

        if (existing) {
            return res.status(400).json({ message: 'Already enrolled' });
        }

        const enrollment = await Enrollment.create({
            student_id: safeStudentId,
            course_id: safeCourseId
        });

        res.status(201).json(enrollment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get my enrollments
// @route   GET /api/enrollments/my
// @access  Private (Student)
const getMyEnrollments = async (req, res) => {
    try {
        const enrollments = await Enrollment.find({ student_id: req.user.id }).populate('course_id');
        res.json(enrollments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Check enrollment status
// @route   GET /api/enrollments/check/:courseId
// @access  Private
const checkEnrollment = async (req, res) => {
  try {
    const { courseId } = req.params;

    // Validate user-controlled IDs
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ message: "Invalid course id" });
    }

    if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const safeCourseId  = new mongoose.Types.ObjectId(courseId);
    const safeStudentId = new mongoose.Types.ObjectId(req.user.id);

    // Query only with trusted values
    const enrollment = await Enrollment.findOne({
      student_id: safeStudentId,
      course_id: safeCourseId
    });

    res.json({ enrolled: !!enrollment });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { enrollCourse, getMyEnrollments, checkEnrollment };
