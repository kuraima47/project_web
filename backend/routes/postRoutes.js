// routes/postRoutes.js
const express = require('express');
const postController = require('../controllers/postController');
const { authenticate } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

const router = express.Router();

router.get('/', authenticate, postController.getAllPosts);
router.get('/following', authenticate, postController.getAllFollowingPosts)
router.get('/:id', authenticate, postController.getPost);
router.get('/infos/:id', authenticate, postController.getPostInfos);
router.get('/user/:address', authenticate, postController.getUserPosts);
router.post('/', authenticate, upload.single('media'), postController.createPost);
router.post('/:id/like', authenticate, postController.likePost);
router.post('/:id/comment', authenticate, postController.commentPost);
router.post('/:id/repost', authenticate, postController.repostPost);
router.get('/media/:photoName', postController.viewImage);

module.exports = router;
