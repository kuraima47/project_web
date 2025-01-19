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


module.exports = Conversation;
