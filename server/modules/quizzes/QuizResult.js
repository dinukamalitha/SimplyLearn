const mongoose = require('mongoose');

const quizResultSchema = new mongoose.Schema({
  quiz_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true,
  },
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  answers: {
    type: Map,
    of: Number,
    required: true,
  },
  score: {
    type: Number,
    required: true,
  },
  total_questions: {
    type: Number,
    required: true,
  },
  percentage: {
    type: Number,
    required: true,
  },
  submitted_at: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Index for faster queries
quizResultSchema.index({ quiz_id: 1, student_id: 1 });
quizResultSchema.index({ student_id: 1, submitted_at: -1 });

module.exports = mongoose.model('QuizResult', quizResultSchema);
