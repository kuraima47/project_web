const express = require('express');
const multer = require('multer');
const profileController = require('../controllers/profileController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const upload = multer(); // Middleware pour gérer les fichiers

router.get('/', authMiddleware, profileController.getProfile);
router.put('/', authMiddleware, upload.single('profilePicture'), profileController.updateProfile);

module.exports = router;
