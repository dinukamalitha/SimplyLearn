const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  assignment_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: true,
  },
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  file_url: {
    type: String,
  },
  text_entry: {
    type: String,
  },
  submission_date: {
    type: Date,
    default: Date.now,
  },
  grade: {
    type: Number,
  },
  feedback: {
    type: String,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Submission', submissionSchema);
