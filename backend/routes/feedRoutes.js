// routes/feedRoutes.js ou routes/index.js
const express = require('express');
const router = express.Router();
const feedController = require('../controllers/feedController');
const { authenticate } = require('../middlewares/auth');

router.get('/general', authenticate, feedController.getGeneralFeed);

module.exports = router;
