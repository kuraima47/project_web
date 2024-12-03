// File: backend/src/models/Message.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Message = sequelize.define('Message', {
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
});

module.exports = Message;