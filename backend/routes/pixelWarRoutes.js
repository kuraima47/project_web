// routes/notificationRoutes.js
const express = require('express');
const pixelWarController = require('../controllers/pixelWarController');
const { authenticate } = require('../middlewares/auth');

const router = express.Router();

router.post('/', authenticate, pixelWarController.placePixel);
router.get('/', authenticate, pixelWarController.getPixels);

module.exports = router;
