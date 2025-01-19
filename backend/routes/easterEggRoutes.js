// routes/feedRoutes.js ou routes/index.js
const express = require('express');
const router = express.Router();
const easterEgg = require('../controllers/easterEggController');
const { authenticate } = require('../middlewares/auth');

router.get('/secret-config', authenticate, easterEgg.handler);

module.exports = router;
