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

// Relations
Post.belongsTo(User, { as: 'author', foreignKey: 'authorId' });
User.hasMany(Post, { foreignKey: 'authorId' });

Post.belongsToMany(Hashtag, { through: 'PostHashtags' });
Hashtag.belongsToMany(Post, { through: 'PostHashtags' });

Post.belongsToMany(User, { through: 'PostLikes', as: 'likedBy', foreignKey: 'postId', unique: true });
User.belongsToMany(Post, { through: 'PostLikes', as: 'likedPosts', foreignKey: 'userId', unique: true });

// Auto-references
Post.belongsTo(Post, { as: 'originalPost', foreignKey: 'originalPostId' });
Post.belongsTo(Post, { as: 'parentPost', foreignKey: 'parentPostId' });
Post.hasMany(Post, { as: 'responses', foreignKey: 'parentPostId' });

module.exports = Post;
