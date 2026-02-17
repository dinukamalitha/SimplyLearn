const mongoose = require("mongoose");
const sanitizeHtml = require("sanitize-html");
const Submission = require("./Submission");
const Assignment = require("./Assignment");
const multer = require("multer");
const path = require("node:path");

// ---------------- Multer config ----------------

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /pdf|doc|docx|pptx|zip/;
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );

    if (!extname) {
      return cb(
        new Error("Only PDF, DOC, DOCX, PPTX and ZIP files are allowed")
      );
    }

    cb(null, true);
  },
});

// ------------------------------------------------

// @desc    Submit assignment
// @route   POST /api/submissions
// @access  Private (Student)
const submitAssignment = async (req, res) => {
  try {
    const { assignment_id, text_entry } = req.body;

    if (!mongoose.Types.ObjectId.isValid(assignment_id)) {
      return res.status(400).json({ message: "Invalid assignment id" });
    }

    if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const safeAssignmentId = new mongoose.Types.ObjectId(assignment_id);
    const safeStudentId = new mongoose.Types.ObjectId(req.user.id);

    const fileUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const assignment = await Assignment.findById(safeAssignmentId);

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    const sanitizedText = text_entry
      ? sanitizeHtml(text_entry, {
          allowedTags: [],
          allowedAttributes: {},
        }).trim()
      : "";

    const existingSubmission = await Submission.findOne({
      assignment_id: safeAssignmentId,
      student_id: safeStudentId,
    });

    if (existingSubmission) {
      if (fileUrl) {
        existingSubmission.file_url = fileUrl;
      }

      if (sanitizedText) {
        existingSubmission.text_entry = sanitizedText;
      }

      existingSubmission.submission_date = new Date();

      await existingSubmission.save();

      return res.json(existingSubmission);
    }

    const submission = await Submission.create({
      assignment_id: safeAssignmentId,
      student_id: safeStudentId,
      file_url: fileUrl,
      text_entry: sanitizedText,
      submission_date: new Date(),
    });

    res.status(201).json(submission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all submissions for an assignment
// @route   GET /api/submissions/:assignmentId
const getSubmissions = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
      return res.status(400).json({ message: "Invalid assignment id" });
    }

    const safeAssignmentId = new mongoose.Types.ObjectId(assignmentId);

    const submissions = await Submission.find({
      assignment_id: safeAssignmentId,
    }).populate("student_id", "name email");

    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user's submission for an assignment
// @route   GET /api/submissions/my/:assignmentId
const getMySubmission = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
      return res.status(400).json({ message: "Invalid assignment id" });
    }

    if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const safeAssignmentId = new mongoose.Types.ObjectId(assignmentId);
    const safeStudentId = new mongoose.Types.ObjectId(req.user.id);

    const submission = await Submission.findOne({
      assignment_id: safeAssignmentId,
      student_id: safeStudentId,
    });

    res.json(submission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Grade a submission
// @route   PATCH /api/submissions/:id/grade
const gradeSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const { grade, feedback } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid submission id" });
    }

    const safeSubmissionId = new mongoose.Types.ObjectId(id);

    const submission = await Submission.findById(safeSubmissionId);

    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    const safeGrade =
      Number.isFinite(grade) && grade >= 0 ? grade : submission.grade;

    const safeFeedback =
      typeof feedback === "string"
        ? sanitizeHtml(feedback, {
            allowedTags: [],
            allowedAttributes: {},
          }).trim()
        : submission.feedback;

    submission.grade = safeGrade;
    submission.feedback = safeFeedback;

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
  upload,
};