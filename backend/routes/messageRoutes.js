const express = require('express');
const messageController = require('../controllers/messageController');
const { authenticate } = require('../middlewares/auth');
const { getAuthConv } = require('../middlewares/authorizeConversationAccess');
const router = express.Router();

// Route pour envoyer un message ou une demande
router.post('/:userId', authenticate, messageController.sendMessage);
router.post('/', authenticate, messageController.sendMessage);
router.post('/:conversationId/markAsSeen',authenticate,messageController.markAsSeen);

// Route pour récupérer toutes les conversations
router.get('/', authenticate, messageController.getConversations);
router.get('/:conversationId/isLastMessageSeen',authenticate,messageController.isLastMessageSeen);
// Route pour récupérer les messages pour une conversation
router.get('/:conversationId', authenticate,getAuthConv, messageController.getConversation);
module.exports = router;
