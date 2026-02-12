const Enrollment = require('./Enrollment');
const Course = require('../courses/Course');

// @desc    Enroll in a course
// @route   POST /api/enrollments
// @access  Private (Student)
const enrollCourse = async (req, res) => {
    const { course_id } = req.body;
    try {
        const existing = await Enrollment.findOne({ student_id: req.user.id, course_id });
        if (existing) {
            return res.status(400).json({ message: 'Already enrolled' });
        }

        const enrollment = await Enrollment.create({
            student_id: req.user.id,
            course_id
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
        const enrollment = await Enrollment.findOne({ student_id: req.user.id, course_id: req.params.courseId });
        res.json({ enrolled: !!enrollment });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = { enrollCourse, getMyEnrollments, checkEnrollment };
