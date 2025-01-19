const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./user');
const Hashtag = require('./hashtag');

const Post = sequelize.define('Post', {
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  media: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  likes: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  reposts: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  originalPostId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  parentPostId: {
    type: DataTypes.INTEGER,
    allowNull: true, // null means it's a root post
  },
});



module.exports = Post;
