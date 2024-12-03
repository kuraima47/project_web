const express = require('express');
const postController = require('../controllers/postController');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// Create a new post
router.post('/', authMiddleware, postController.createPost);

// Get all posts
router.get('/', authMiddleware, postController.getAllPosts);

// Route to get recent tweets
router.get("/recent",authMiddleware, postController.getRecentPosts);

// Like a post
router.post('/:postId/like', authMiddleware, postController.likePost);

// Comment on a post
router.post('/:postId/comment', authMiddleware, postController.commentOnPost);

// Retweet a post
router.post('/:postId/retweet', authMiddleware, postController.retweetPost);

module.exports = router;