const express = require('express');
const router = express.Router();
const { getAssignments, getAssignmentById, createAssignment, getStudentAssignments, getTutorAssignments } = require('./assignmentController');
const { protect } = require('../../middleware/authMiddleware');

router.get('/student/my', protect, getStudentAssignments);
router.get('/tutor/my', protect, getTutorAssignments);
router.get('/course/:courseId', protect, getAssignments);
router.get('/:id', protect, getAssignmentById);
router.post('/', protect, createAssignment);

module.exports = router;
