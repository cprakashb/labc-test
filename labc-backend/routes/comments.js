const express = require('express');
const router = express.Router();
const commentController = require('../controllers/comments');

// POST  → add a comment or reply
router.post('/', commentController.addCommentToPost);

// GET /:postId → fetch all comments for a post
router.get('/:postId', commentController.getCommentsForPost);

// DELETE /:id → delete a comment by ID
router.delete('/:id', commentController.deleteComment);

module.exports = router;
