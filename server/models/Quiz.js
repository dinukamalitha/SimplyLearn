const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  course_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  questions: [{
    question_text: String,
    options: [String],
    correct_option_index: Number,
    type: { type: String, enum: ['Multiple Choice', 'True/False'], default: 'Multiple Choice' }
  }],
  timer_limit: {
    type: Number, // in minutes
    default: 30,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Quiz', quizSchema);
