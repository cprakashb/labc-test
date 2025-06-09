const Comment = require('../models/Comment');

// Add comment or reply
exports.addCommentToPost = async (req, res) => {
  try {
    const { postId, parentCommentId = null, author, comment } = req.body;

    if (!postId || !author || !comment) {
      return res.status(400).json({ error: 'postId, author, and comment are required' });
    }

    const newComment = new Comment({
      postId,
      parentCommentId,
      author,
      comment
    });

    const saved = await newComment.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error('Error creating comment:', err);
    res.status(500).json({ error: 'Failed to add comment' });
  }
};

// Get all comments for a post
exports.getCommentsForPost = async (req, res) => {
  try {
    const { postId } = req.params;

    const comments = await Comment.find({ postId }).sort({ createdAt: 1 }).lean();

    // Nest comments
    const map = {};
    const roots = [];

    comments.forEach(comment => {
      comment.replies = [];
      if (comment._id)
        map[comment._id] = comment;
    });

    comments.forEach(comment => {
      if (comment.parentCommentId) {
        const parentId = comment.parentCommentId;
        map[parentId]?.replies?.push(comment);
      } else {
        roots.push(comment);
      }
    });

    res.json(roots);
  } catch (err) {
    console.error('Error fetching comments:', err);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
};

// Delete comment by ID
exports.deleteComment = async (req, res) => {
  try {
    const { id } = req.params;

    await Comment.deleteMany({ parentCommentId: id });

    const result = await Comment.findByIdAndDelete(id);

    if (!result) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    res.json({ message: 'Comment deleted' });
  } catch (err) {
    console.error('Error deleting comment:', err);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
};