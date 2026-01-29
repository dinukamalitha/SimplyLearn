const express = require('express');
const router = express.Router();
const { submitAssignment, getSubmissions, getMySubmission, gradeSubmission } = require('../controllers/submissionController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, submitAssignment);
router.get('/assignment/:assignmentId', protect, getSubmissions);
router.get('/my/:assignmentId', protect, getMySubmission);
router.put('/:id/grade', protect, gradeSubmission);

module.exports = router;
