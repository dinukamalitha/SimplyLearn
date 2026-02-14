const ForumPost = require('./ForumPost');
const sanitizeHtml = require('sanitize-html');

const getPosts = async (req, res) => {
  try {
    const { courseId } = req.params;

    // Validate and normalize courseId
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ message: "Invalid course id" });
    }
    const safeCourseId = new mongoose.Types.ObjectId(courseId);

    // Query using only trusted value
    const posts = await ForumPost.find({ course_id: safeCourseId })
      .populate("user_id", "name role")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createPost = async (req, res) => {
  const { course_id, content, parent_post_id } = req.body;

  try {
    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(course_id)) {
      return res.status(400).json({ message: "Invalid course id" });
    }
    const safeCourseId = new mongoose.Types.ObjectId(course_id);

    let safeParentPostId = null;
    if (parent_post_id) {
      if (!mongoose.Types.ObjectId.isValid(parent_post_id)) {
        return res.status(400).json({ message: "Invalid parent post id" });
      }
      safeParentPostId = new mongoose.Types.ObjectId(parent_post_id);
    }

    const safeUserId = new mongoose.Types.ObjectId(req.user.id);

    // Sanitize content
    const sanitizedContent = sanitizeHtml(content, {
      allowedTags: [],
      allowedAttributes: {},
    }).trim();

    // Create post using trusted values
    const post = await ForumPost.create({
      course_id: safeCourseId,
      user_id: safeUserId,
      content: sanitizedContent,
      parent_post_id: safeParentPostId
    });

    // Populate user info for response
    const populatedPost = await ForumPost.findById(post._id)
      .populate("user_id", "name role");

    res.status(201).json(populatedPost);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getPosts, createPost };
