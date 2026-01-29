const Submission = require('../models/Submission');
const Assignment = require('../models/Assignment');

// @desc    Submit assignment
// @route   POST /api/submissions
// @access  Private (Student)
const submitAssignment = async (req, res) => {
  const { assignment_id, file_url, text_entry } = req.body;

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

// @desc    Get submissions for an assignment
// @route   GET /api/submissions/assignment/:assignmentId
// @access  Private (Tutor)
const getSubmissions = async (req, res) => {
  try {
    // Ideally verify tutor ownership here, but for simplicity relying on role check in middleware + logic
    const submissions = await Submission.find({ assignment_id: req.params.assignmentId })
        .populate('student_id', 'name email');
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get my submission for an assignment
// @route   GET /api/submissions/my/:assignmentId
// @access  Private
const getMySubmission = async (req, res) => {
    try {
        const submission = await Submission.findOne({ 
            assignment_id: req.params.assignmentId, 
            student_id: req.user.id 
        });
        res.json(submission || null);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// @desc    Grade submission
// @route   PUT /api/submissions/:id/grade
// @access  Private (Tutor)
const gradeSubmission = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);
    if (!submission) {
        return res.status(404).json({ message: 'Submission not found' });
    }

    submission.grade = req.body.grade;
    submission.feedback = req.body.feedback;
    
    const updated = await submission.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  submitAssignment,
  getSubmissions,
  getMySubmission,
  gradeSubmission
};
