const express = require('express');
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// Get user profile
router.get('/:userId', authMiddleware, userController.getProfile);

// Update user profile
router.put('/:userId', authMiddleware, userController.updateProfile);

// Follow a user
router.post('/:userId/follow', authMiddleware, userController.followUser);

// Unfollow a user
router.post('/:userId/unfollow', authMiddleware, userController.unfollowUser);

module.exports = router;