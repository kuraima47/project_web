const { Message, User } = require('../models');
const { Op } = require('sequelize');

exports.sendMessage = async (req, res, next) => {
  try {
    const { recipientId, content } = req.body;
    const senderId = req.user.id;

    const message = await Message.create({
      senderId,
      recipientId,
      content
    });

    res.status(201).json({
      status: 'success',
      data: {
        message
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getConversation = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { senderId: currentUserId, recipientId: userId },
          { senderId: userId, recipientId: currentUserId }
        ]
      },
      order: [['createdAt', 'ASC']],
      include: [
        { model: User, as: 'sender', attributes: ['id', 'username'] },
        { model: User, as: 'recipient', attributes: ['id', 'username'] }
      ]
    });

    res.status(200).json({
      status: 'success',
      data: {
        messages
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllConversations = async (req, res, next) => {
  try {
    const currentUserId = req.user.id;

    const conversations = await Message.findAll({
      where: {
        [Op.or]: [
          { senderId: currentUserId },
          { recipientId: currentUserId }
        ]
      },
      order: [['createdAt', 'DESC']],
      include: [
        { model: User, as: 'sender', attributes: ['id', 'username'] },
        { model: User, as: 'recipient', attributes: ['id', 'username'] }
      ],
      group: [
        'Message.id',
        'sender.id',
        'recipient.id'
      ]
    });

    res.status(200).json({
      status: 'success',
      data: {
        conversations
      }
    });
  } catch (error) {
    next(error);
  }
};