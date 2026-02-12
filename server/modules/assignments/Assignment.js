const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  course_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  instructions: {
    type: String,
  },
  deadline: {
    type: Date,
    required: true,
  },
  max_points: {
    type: Number,
    default: 100,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Assignment', assignmentSchema);
