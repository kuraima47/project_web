const {Conversation} = require('../models');

exports.getAuthConv = async (req, res, next) => {
  try {
    const userId = req.user.id; // ID de l'utilisateur connecté
    const conversationId = req.params.conversationId; // ID de la conversation
 
    // Rechercher la conversation
    const conversation = await Conversation.findOne({
      where: { id: conversationId },
    });

    // Vérifier si la conversation existe
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation introuvable.' });
    }

    // Vérifier si l'utilisateur est soit le sender soit le receiver
    if (conversation.senderId !== userId && conversation.receiverId !== userId) {
      return res.status(403).json({ message: 'Accès non autorisé à cette conversation.' });
    }

    // Ajouter les informations de la conversation à la requête pour usage futur
    req.conversation = conversation;
    next();
  } catch (error) {
    console.error('Erreur dans le middleware authorizeConversationAccess :', error);
    return res.status(500).json({ message: 'Erreur serveur.' });
  }
};
