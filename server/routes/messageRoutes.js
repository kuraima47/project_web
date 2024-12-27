const express = require('express');
const messageController = require('../controllers/messageController');
const { authenticate } = require('../middlewares/auth');
const router = express.Router();

// Route pour envoyer un message ou une demande
router.post('/:userId', authenticate, messageController.sendMessage);
router.post('/', authenticate, messageController.sendMessage);

// Route pour récupérer toutes les conversations
router.get('/', authenticate, messageController.getConversations);
// Route pour récupérer les messages pour une conversation
router.get('/:conversationId', authenticate, messageController.getConversation);
module.exports = router;
