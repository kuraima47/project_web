// routes/userRoutes.js
const express = require('express');
const userController = require('../controllers/userController');
const { authenticate } = require('../middlewares/auth');

const router = express.Router();

router.post('/auth', userController.authenticate);
router.post('/register', userController.register);
router.get('/profile/:address', authenticate, userController.getProfile);
router.put('/update', authenticate, userController.updateProfile);
// -- Follows --
router.post('/:id/follow', authenticate, userController.followUser);
router.delete('/:id/unfollow', authenticate, userController.unfollowUser);
router.get('/:id/followers', authenticate, userController.getFollowers);
router.get('/:id/following', authenticate, userController.getFollowing);
module.exports = router;
