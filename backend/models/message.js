const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./user');
const Conversation = require('./conversation');  // Importation correcte du modèle Conversation

const Message = sequelize.define('Message', {
  conversationId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Conversation,
      key: 'id',
    },
  },
  senderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
  },
  receiverId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  isPending: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'Messages',
  timestamps: true,
});



module.exports = Message;
