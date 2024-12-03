// File: backend/src/models/Post.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Post = sequelize.define('Post', {
  content: {
    type: DataTypes.STRING(280),
    allowNull: false
  }
});

module.exports = Post;