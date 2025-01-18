const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./user');
const Post = require('./post')

const Repost = sequelize.define('Repost', {
    postId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, { timestamps: true });
  
  // Relation avec les utilisateurs et les posts
  User.belongsToMany(Post, { through: Repost, foreignKey: 'userId', as: 'repostedPosts' });
  Post.belongsToMany(User, { through: Repost, foreignKey: 'postId', as: 'repostedBy' });
  
  module.exports = Repost;
  