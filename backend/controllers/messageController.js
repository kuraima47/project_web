const { Op } = require('sequelize');
const Message = require('../models/message');
const User = require('../models/user');
const Conversation = require('../models/conversation');

const messageController = {
  // Envoi d'un message
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
      }

      // Créer un nouveau message rattaché à la conversation
      const newMessage = await Message.create({
        conversationId: conversation.id,
        senderId: senderId,
        receiverId: receiverId,
        content: content,
        isPending: true, // Par défaut, le message est en attente
      });

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
          }
        ]
      });

      return res.status(201).json(messageWithUsers);

    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Erreur lors de l\'envoi du message.' });
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
          {
            model: User,    
            as: 'sender',     
            attributes: ['id', 'username', 'avatar', 'address'],
          },
          {
            model: User,         
            as: 'receiver',       
            attributes: ['id', 'username', 'avatar', 'address'], 
          },
          {
            model: Message,      
            as: 'messages',   
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
              }
            ],
            order: [['createdAt', 'ASC']], 
          }
        ]
      });

      if (!conversation) {
        return res.status(404).json({ message: 'Conversation introuvable.' });
      }
      
      console.log(conversation.receiver.id);
      console.log(req.user.id);
      console.log(conversation.receiver.id === req.user.id);

      return res.status(200).json({
        conversation,
        currentUser: req.user,
        friendUser: conversation.receiver.id === req.user.id ? conversation.sender : conversation.receiver
       });

    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Erreur lors de la récupération des messages.' });
    }
  },

  // Récupérer toutes les conversations pour un utilisateur
  getConversations: async (req, res) => {
    try {
      const userId = req.user.id;

      // Trouver toutes les conversations associées à l'utilisateur
      const conversations = await Conversation.findAll({
        where: {
          [Op.or]: [{ senderId: userId }, { receiverId: userId }],
        },
        include: [
          {
            model: User,
            as: 'sender',
            attributes: ['id', 'username', 'avatar', 'address'],
          },
          {
            model: User,
            as: 'receiver',
            attributes: ['id', 'username', 'avatar', 'address'],
          },
          {
            model: Message,
            as: 'messages',
            limit: 1,
            order: [['createdAt', 'DESC']],
          },
        ],
        order: [['createdAt', 'DESC']],
      });

      const conversationData = conversations.map(convo => ({
        conversationId: convo.id,
        users: [
          { id: convo.sender.id, username: convo.sender.username, avatar: convo.sender.avatar, address: convo.sender.address},
          { id: convo.receiver.id, username: convo.receiver.username, avatar: convo.receiver.avatar, address: convo.receiver.address }
        ],
        lastMessage: convo.messages[0] ? convo.messages[0].content : 'Aucun message',
        timestamp: convo.messages[0] ? convo.messages[0].createdAt : convo.createdAt,
      }));

      return res.status(200).json({ conversations: conversationData, userId: req.user.id });

    } catch (error) {
      console.error('Erreur lors de la récupération des conversations :', error);
      return res.status(500).json({ message: 'Erreur lors de la récupération des conversations' });
    }
  },
};

module.exports = messageController;
