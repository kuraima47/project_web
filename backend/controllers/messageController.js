const { Op, Sequelize} = require('sequelize');
const Message = require('../models/message');
const User = require('../models/user');
const Conversation = require('../models/conversation');
const ConversationSeen = require('../models/conversationSeen');

const messageController = {
  // Envoi d'un message

  markAsSeen: async (req, res) => {
    const userId = req.user.id; // Assurez-vous que l'ID utilisateur est bien accessible ici
    const { conversationId } = req.params; // Récupère l'ID de la conversation dans les paramètres
  
    try {
      // Vérifier si la conversation existe
      const conversation = await Conversation.findByPk(conversationId);
  
      if (!conversation) {
        return res.status(404).json({ message: "Conversation non trouvée" });
      }
  
      // Mettre à jour le champ "seen" pour cet utilisateur et cette conversation
      const updated = await ConversationSeen.update(
        { seen: true }, // Met à jour le champ "seen" à true
        {
          where: {
            conversationId,
            userId,
          },
        }
      );
  
      // Vérifier si l'enregistrement a été mis à jour
      if (updated[0] === 0) {
        return res
          .status(400)
          .json({ message: "Impossible de marquer la conversation comme vue" });
      }
  
      // Retourner la réponse avec un statut 200
      return res.status(200).json({
        message: "Messages marqués comme vus",
        conversationId,
        userId,
        seen: true,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erreur serveur" });
    }
  },
  

  sendMessage: async (req, res) => {
    let receiverId;
    const senderId = req.user.id;
    const { username, content } = req.body;

    try {
      // Si un userId est fourni dans l'URL
      if (req.params.userId) {
        const receiver = await User.findOne({
          where: { id: req.params.userId },
        });

        if (!receiver) {
          return res.status(404).json({ message: 'Utilisateur introuvable.' });
        }
        receiverId = receiver.id;
      } 
      // Sinon, chercher l'utilisateur par username dans le corps de la requête
      else if (username) {
        const receiver = await User.findOne({
          where: { username: username },
        });

        if (!receiver) {
          return res.status(404).json({ message: 'Utilisateur introuvable.' });
        }
        receiverId = receiver.id;
      } else {
        return res.status(400).json({ message: 'Aucun utilisateur spécifié.' });
      }

      // Vérifier s'il existe une conversation existante entre les deux utilisateurs
      let conversation = await Conversation.findOne({
        where: {
          [Op.or]: [
            { senderId: senderId, receiverId: receiverId },
            { senderId: receiverId, receiverId: senderId },
          ],
        },
      });

      // Si aucune conversation n'existe, créer une nouvelle conversation
      if (!conversation) {
        conversation = await Conversation.create({
          senderId: senderId,
          receiverId: receiverId,
        });

        // Créer des entrées dans ConversationSeen pour chaque utilisateur
        await ConversationSeen.bulkCreate([
          { conversationId: conversation.id, userId: senderId, seen: true }, // Le créateur voit immédiatement la conversation
          { conversationId: conversation.id, userId: receiverId, seen: false },
        ]);
      }

      // Créer un nouveau message rattaché à la conversation
      const newMessage = await Message.create({
        conversationId: conversation.id,
        senderId: senderId,
        receiverId: receiverId,
        content: content,
        isPending: true, // Par défaut, le message est en attente
      });

      // Marquer le message comme "not seen" pour le receiver
      await ConversationSeen.update(
        { seen: false },
        { where: { conversationId: conversation.id, userId: receiverId } }
      );

      const messageWithUsers = await Message.findOne({
        where: { id: newMessage.id },
        include: [
          {
            model: User,
            as: 'sender',
            attributes: ['id', 'username', 'avatar'],
          },
          {
            model: User,
            as: 'receiver',
            attributes: ['id', 'username', 'avatar'],
          },
        ],
      });

      return res.status(201).json(messageWithUsers);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erreur lors de l'envoi du message." });
    }
  },

  // Récupérer les messages d'une conversation
  getConversation: async (req, res) => {
    const conversationId = req.params.conversationId;

    try {
      // Trouver la conversation entre l'utilisateur actuel et l'ami
      const conversation = await Conversation.findOne({
        where: { id: conversationId },
        include: [
          { model: User, as: 'sender', attributes: ['id', 'username', 'avatar', 'address'] },
          { model: User, as: 'receiver', attributes: ['id', 'username', 'avatar', 'address'] },
          {
            model: Message,
            as: 'messages',
            include: [
              { model: User, as: 'sender', attributes: ['id', 'username', 'avatar'] },
              { model: User, as: 'receiver', attributes: ['id', 'username', 'avatar'] },
            ],
            order: [['createdAt', 'ASC']],
          },
        ],
      });

      if (!conversation) return res.status(404).json({ message: 'Conversation introuvable.' });

      // Mettre à jour les messages comme "vu" pour l'utilisateur actuel
      await ConversationSeen.update(
        { seen: true },
        { where: { conversationId: conversation.id, userId: req.user.id } }
      );

      // Inclure le statut de "vu" pour chaque utilisateur de la conversation
      const conversationSeen = await ConversationSeen.findAll({
        where: { conversationId: conversation.id },
        attributes: ['userId', 'seen'],
      });

      return res.status(200).json({
        conversation,
        currentUser: req.user,
        friendUser: conversation.receiver.id === req.user.id ? conversation.sender : conversation.receiver,
        seenStatus: conversationSeen,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Erreur lors de la récupération des messages.' });
    }
  },

  // Récupérer toutes les conversations pour un utilisateur
  getConversations: async (req, res) => {
    const userId = req.user.id;

    try {
      // Trouver toutes les conversations associées à l'utilisateur
      const conversations = await Conversation.findAll({
        where: {
          [Op.or]: [{ senderId: userId }, { receiverId: userId }],
        },
        include: [
          { model: User, as: 'sender', attributes: ['id', 'username', 'avatar', 'address'] },
          { model: User, as: 'receiver', attributes: ['id', 'username', 'avatar', 'address'] },
          {
            model: Message,
            as: 'messages',
            limit: 1,
            order: [['createdAt', 'DESC']],
          },
        ],
        order: [['createdAt', 'DESC']],
      });

      const conversationIds = conversations.map((convo) => convo.id);
      const conversationSeenStatuses = await ConversationSeen.findAll({
        where: { conversationId: { [Op.in]: conversationIds } },
        attributes: ['conversationId', 'userId', 'seen'],
      });

      const conversationData = conversations.map((convo) => {
        const seenStatuses = conversationSeenStatuses.filter(
          (status) => status.conversationId === convo.id
        );

        return {
          conversationId: convo.id,
          users: [
            {
              id: convo.sender.id,
              username: convo.sender.username,
              avatar: convo.sender.avatar,
              address: convo.sender.address,
            },
            {
              id: convo.receiver.id,
              username: convo.receiver.username,
              avatar: convo.receiver.avatar,
              address: convo.receiver.address,
            },
          ],
          lastMessage: convo.messages[0] ? convo.messages[0].content : 'Aucun message',
          timestamp: convo.messages[0] ? convo.messages[0].createdAt : convo.createdAt,
          seenStatus: seenStatuses,
        };
      });

      return res.status(200).json({ conversations: conversationData, userId });
    } catch (error) {
      console.error('Erreur lors de la récupération des conversations :', error);
      return res.status(500).json({ message: 'Erreur lors de la récupération des conversations' });
    }
  },
  isLastMessageSeen: async (req, res) => {
    const { conversationId } = req.params;
  
    try {
      // Récupérer la conversation avec les deux utilisateurs
      const conversation = await Conversation.findOne({
        where: { id: conversationId },
        include: [
          { model: User, as: 'sender', attributes: ['id'] },
          { model: User, as: 'receiver', attributes: ['id'] }
        ]
      });
  
      if (!conversation) {
        return res.status(404).json({ message: 'Conversation non trouvée.' });
      }
  
      // Trouver l'ID de l'autre utilisateur dans la conversation
      const otherUserId = conversation.senderId === req.user.id ? conversation.receiverId : conversation.senderId;
  
      // Récupérer le dernier message de la conversation
      const lastMessage = await Message.findOne({
        where: { conversationId },
        order: [['createdAt', 'DESC']],
      });
  
      if (!lastMessage) {
        return res.status(404).json({ message: 'Aucun message trouvé dans cette conversation.' });
      }
  
      // Vérifier si l'autre utilisateur a vu ce dernier message
      const seenStatus = await ConversationSeen.findOne({
        where: {
          conversationId,
          userId: otherUserId,
        },
      });
  
      return res.status(200).json({
        seen: seenStatus ? seenStatus.seen : false, // Retourne true si l'autre utilisateur a vu le message
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Erreur lors de la vérification du message.' });
    }
  },  
};

module.exports = messageController;
