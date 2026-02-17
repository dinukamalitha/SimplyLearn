const mongoose = require('mongoose');
const ForumPost = require('./ForumPost');
const sanitizeHtml = require('sanitize-html');

// GET posts by course
const getPosts = async (req, res) => {
  try {
    const { courseId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ message: "Invalid course id" });
    }
    const safeCourseId = new mongoose.Types.ObjectId(courseId);

    const posts = await ForumPost.find({ course_id: safeCourseId })
      .populate("user_id", "name role")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ message: "Failed to fetch posts" });
  }
};

// CREATE a new post
const createPost = async (req, res) => {
  const { course_id, content, parent_post_id } = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(course_id)) {
      return res.status(400).json({ message: "Invalid course id" });
    }
    const safeCourseId = new mongoose.Types.ObjectId(course_id);

    if (!content || content.trim() === "") {
      return res.status(400).json({ message: "Content cannot be empty" });
    }

    let safeParentPostId = null;
    if (parent_post_id) {
      if (!mongoose.Types.ObjectId.isValid(parent_post_id)) {
        return res.status(400).json({ message: "Invalid parent post id" });
      }

      // Check if parent post exists
      const parentPostExists = await ForumPost.findById(parent_post_id);
      if (!parentPostExists) {
        return res.status(400).json({ message: "Parent post does not exist" });
      }

      safeParentPostId = new mongoose.Types.ObjectId(parent_post_id);
    }

    const safeUserId = new mongoose.Types.ObjectId(req.user.id);

    const sanitizedContent = sanitizeHtml(content, {
      allowedTags: ["b", "i", "u", "strong", "em", "ul", "li", "p"],
      allowedAttributes: {},
    }).trim();

    const post = await ForumPost.create({
      course_id: safeCourseId,
      user_id: safeUserId,
      content: sanitizedContent,
      parent_post_id: safeParentPostId,
    });

    const populatedPost = await ForumPost.findById(post._id).populate(
      "user_id",
      "name role"
    );

    res.status(201).json(populatedPost);
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ message: "Failed to create post" });
  }
};

module.exports = { getPosts, createPost };
