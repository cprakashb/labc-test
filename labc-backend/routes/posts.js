const express = require('express');
const router = express.Router();
const multer = require('multer');
const postController = require('../controllers/posts');

// Setup file upload using multer (in-memory storage)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// CREATE: POST /posts (with file upload)
router.post('/', upload.single('file'), postController.createPost);

// READ: GET  → get all posts
router.get('/', postController.getAllPosts);

// READ: GET /:id → get single post
router.get('/:id', postController.getPostById);

// UPDATE: PUT /:id → update post (no file reupload in this example)
router.put('/:id', postController.updatePost);

// DELETE: DELETE /:id → delete post and file
router.delete('/:id', postController.deletePost);

module.exports = router;
