const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./user');


const Conversation = sequelize.define('Conversation', {
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
}, {
  tableName: 'Conversations',
  timestamps: true,
});

Conversation.belongsTo(User, { as: 'sender', foreignKey: 'senderId' });
Conversation.belongsTo(User, { as: 'receiver', foreignKey: 'receiverId' });
User.hasMany(Conversation, { as: 'sentConversations', foreignKey: 'senderId' });
User.hasMany(Conversation, { as: 'receivedConversations', foreignKey: 'receiverId' });

module.exports = Conversation;
