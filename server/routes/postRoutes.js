// routes/postRoutes.js
const express = require('express');
const postController = require('../controllers/postController');
const { authenticate } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

const router = express.Router();

router.get('/', authenticate, postController.getAllPosts);
router.post('/', authenticate, upload.single('media'), postController.createPost);
router.get('/:id', authenticate, postController.getPost);
router.post('/:id/like', authenticate, postController.likePost);
router.post('/:id/comment', authenticate, postController.commentPost);
router.post('/:id/repost', authenticate, postController.repostPost);

module.exports = router;
