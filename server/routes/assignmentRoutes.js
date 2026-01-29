const express = require('express');
const router = express.Router();
const { getAssignments, getAssignmentById, createAssignment } = require('../controllers/assignmentController');
const { protect } = require('../middleware/authMiddleware');

router.get('/course/:courseId', protect, getAssignments);
router.get('/:id', protect, getAssignmentById);
router.post('/', protect, createAssignment);

module.exports = router;
