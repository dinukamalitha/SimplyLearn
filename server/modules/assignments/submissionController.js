const mongoose = require('mongoose');
const sanitizeHtml = require('sanitize-html');
const Submission = require('./Submission');
const Assignment = require('./Assignment');
const multer = require('multer');
const path = require('node:path');

// Configure Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /pdf|doc|docx|pptx|zip/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (extname) {
      return cb(null, true);
    }
    cb(new Error('Only PDF, DOC, PPTX, and ZIP files are allowed!'));
  }
});

// @desc    Submit assignment
// @route   POST /api/submissions
// @access  Private (Student)
const submitAssignment = async (req, res) => {
  const { assignment_id, text_entry } = req.body;
  const file_url = req.file
    ? `/uploads/${req.file.filename}`
    : req.body.file_url;

  try {
    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(assignment_id)) {
      return res.status(400).json({ message: "Invalid assignment id" });
    }
    if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
      return res.status(400).json({ message: "Invalid user id" });
    }
    const safeAssignmentId = new mongoose.Types.ObjectId(assignment_id);
    const safeStudentId = new mongoose.Types.ObjectId(req.user.id);

    // Check assignment exists
    const assignment = await Assignment.findById(safeAssignmentId);
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    // Sanitize text_entry
    const sanitizedText = text_entry
      ? sanitizeHtml(text_entry, { allowedTags: [], allowedAttributes: {} }).trim()
      : "";

    // Check existing submission
    const existingSubmission = await Submission.findOne({
      assignment_id: safeAssignmentId,
      student_id: safeStudentId
    });

    if (existingSubmission) {
      existingSubmission.file_url = file_url || existingSubmission.file_url;
      existingSubmission.text_entry = sanitizedText || existingSubmission.text_entry;
      existingSubmission.submission_date = new Date();

      await existingSubmission.save();
      return res.json(existingSubmission);
    }

    // Create new submission
    const submission = await Submission.create({
      assignment_id: safeAssignmentId,
      student_id: safeStudentId,
      file_url,
      text_entry: sanitizedText,
      submission_date: new Date()
    });

    res.status(201).json(submission);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all submissions for an assignment
const getSubmissions = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    // Validate user-controlled input
    if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
      return res.status(400).json({ message: "Invalid assignment id" });
    }

    // Normalize to a trusted value
    const safeAssignmentId = new mongoose.Types.ObjectId(assignmentId);

    // Build the query only from trusted data
    const submissions = await Submission.find({
      assignment_id: safeAssignmentId
    }).populate("student_id", "name email");

    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user's submission for an assignment
const getMySubmission = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    // Validate user-controlled values
    if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
      return res.status(400).json({ message: "Invalid assignment id" });
    }

    if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    // Normalize into trusted ObjectIds
    const safeAssignmentId = new mongoose.Types.ObjectId(assignmentId);
    const safeStudentId = new mongoose.Types.ObjectId(req.user.id);

    // Build the query only from trusted values
    const submission = await Submission.findOne({
      assignment_id: safeAssignmentId,
      student_id: safeStudentId
    });

    res.json(submission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Grade a submission
const gradeSubmission = async (req, res) => {
  const { grade, feedback } = req.body;
  const { id } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid submission id" });
    }

    const safeSubmissionId = new mongoose.Types.ObjectId(id);

    const submission = await Submission.findById(safeSubmissionId);

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    submission.grade = grade;
    submission.feedback = feedback;
    const updatedSubmission = await submission.save();

    res.json(updatedSubmission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  submitAssignment,
  getSubmissions,
  getMySubmission,
  gradeSubmission,
  upload
};
