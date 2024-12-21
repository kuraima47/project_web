// models/post.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./user');
const Comment = require('./comment');
const Hashtag = require('./hashtag');

/**
 * Modèle Post : on stocke l'auteur dans 'authorId' (FK vers la table User).
 * Ajout du champ originalPostId pour le repost.
 */
const Post = sequelize.define('Post', {
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  media: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  // Pour gérer le repost
  originalPostId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
});

// Relation post <-> user (author)
Post.belongsTo(User, { as: 'author', foreignKey: 'authorId' });
User.hasMany(Post, { foreignKey: 'authorId' });

// Relation post <-> comment
Post.hasMany(Comment, { foreignKey: 'postId' });
Comment.belongsTo(Post, { foreignKey: 'postId' });

// Relation user <-> comment
User.hasMany(Comment, { foreignKey: 'userId' });
Comment.belongsTo(User, { foreignKey: 'userId' });

// Relation post <-> hashtag (many-to-many)
Post.belongsToMany(Hashtag, { through: 'PostHashtags' });
Hashtag.belongsToMany(Post, { through: 'PostHashtags' });

Post.belongsToMany(User, { through: 'PostLikes', as: 'likedBy' });
User.belongsToMany(Post, { through: 'PostLikes', as: 'likedPosts' });

// Auto-référence pour gérer l'originalPost en cas de repost
Post.belongsTo(Post, { as: 'originalPost', foreignKey: 'originalPostId' });

module.exports = Post;
