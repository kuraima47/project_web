const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Conversation = require('./conversation');
const User = require('./user');

const ConversationSeen = sequelize.define('ConversationSeen', {
  conversationId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Conversation,
      key: 'id',
    },
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
  },
  seen: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
}, {
  tableName: 'ConversationSeen',
  timestamps: true,
});



module.exports = ConversationSeen;
