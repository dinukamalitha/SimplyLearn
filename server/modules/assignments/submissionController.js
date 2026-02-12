const Submission = require('./Submission');
const Assignment = require('./Assignment');
const multer = require('multer');
const path = require('path');

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
  const file_url = req.file ? `/uploads/${req.file.filename}` : req.body.file_url;

  try {
    const assignment = await Assignment.findById(assignment_id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check if already submitted
    const existingSubmission = await Submission.findOne({
      assignment_id,
      student_id: req.user.id
    });

    if (existingSubmission) {
      // Update existing
      existingSubmission.file_url = file_url || existingSubmission.file_url;
      existingSubmission.text_entry = text_entry || existingSubmission.text_entry;
      existingSubmission.submission_date = Date.now();
      const updated = await existingSubmission.save();
      return res.json(updated);
    }

    const submission = await Submission.create({
      assignment_id,
      student_id: req.user.id,
      file_url,
      text_entry
    });

    res.status(201).json(submission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all submissions for an assignment
const getSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ assignment_id: req.params.assignmentId })
      .populate('student_id', 'name email');
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user's submission for an assignment
const getMySubmission = async (req, res) => {
  try {
    const submission = await Submission.findOne({
      assignment_id: req.params.assignmentId,
      student_id: req.user.id
    });
    res.json(submission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Grade a submission
const gradeSubmission = async (req, res) => {
  const { grade, feedback } = req.body;

  try {
    const submission = await Submission.findById(req.params.id);

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
  upload // Export the upload middleware
};
