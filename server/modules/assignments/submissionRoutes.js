const express = require('express');
const router = express.Router();
const { submitAssignment, getSubmissions, getMySubmission, gradeSubmission, upload } = require('./submissionController');
const { protect } = require('../../middleware/authMiddleware');

router.post('/', protect, upload.single('file'), submitAssignment);
router.get('/assignment/:assignmentId', protect, getSubmissions);
router.get('/my/:assignmentId', protect, getMySubmission);
router.put('/:id/grade', protect, gradeSubmission);

module.exports = router;
