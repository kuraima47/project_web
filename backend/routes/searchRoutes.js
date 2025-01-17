// routes/searchRoutes.js
const express = require('express');
const searchController = require('../controllers/searchController');
const { authenticate } = require('../middlewares/auth');

const router = express.Router();

router.get('/', authenticate, searchController.search);

module.exports = router;
