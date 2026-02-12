const express = require('express');
const router = express.Router();
const { getPosts, createPost } = require('./forumController');
const { protect } = require('../../middleware/authMiddleware');

router.get('/course/:courseId', protect, getPosts);
router.post('/', protect, createPost);

module.exports = router;
