const express = require('express');
const messageController = require('../controllers/messageController');
const router = express.Router();
const authMiddleware = require('../middleware/auth');

// Send a message
router.post('/', authMiddleware, messageController.sendMessage);

// Get conversation history
router.get('/:conversationId', authMiddleware, messageController.getConversation);

module.exports = router;