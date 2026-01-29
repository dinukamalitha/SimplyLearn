const mongoose = require('mongoose');

const forumPostSchema = new mongoose.Schema({
  course_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  parent_post_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ForumPost',
    default: null, // For replies
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('ForumPost', forumPostSchema);
