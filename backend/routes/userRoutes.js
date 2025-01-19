// routes/userRoutes.js
const express = require('express');
const userController = require('../controllers/userController');
const { authenticate } = require('../middlewares/auth');

const router = express.Router();

router.post('/auth', userController.authenticate);
router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/profile/:address', authenticate, userController.getProfile);
router.get('/fromToken/', authenticate, userController.getFromToken);
router.put('/update', authenticate, userController.updateProfile);
// -- Follows --
router.post('/:address/follow', authenticate, userController.followUser);
router.delete('/:address/unfollow', authenticate, userController.unfollowUser);
router.get('/:address/dofollow',authenticate, userController.doFollow);
router.get('/:address/followers', authenticate, userController.getFollowers);
router.get('/:address/following', authenticate, userController.getFollowing);
module.exports = router;
