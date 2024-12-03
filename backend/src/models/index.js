// File: backend/src/models/index.js
const User = require('./User');
const Post = require('./Post');
const Message = require('./Message');

User.hasMany(Post, { as: 'posts', foreignKey: 'authorId' });
Post.belongsTo(User, { as: 'author', foreignKey: 'authorId' });

User.belongsToMany(User, { as: 'followers', through: 'Followers', foreignKey: 'followingId', otherKey: 'followerId' });
User.belongsToMany(User, { as: 'following', through: 'Followers', foreignKey: 'followerId', otherKey: 'followingId' });

User.belongsToMany(Post, { as: 'likedPosts', through: 'Likes' });
Post.belongsToMany(User, { as: 'likedBy', through: 'Likes' });

Post.hasMany(Post, { as: 'comments', foreignKey: 'parentId' });
Post.belongsTo(Post, { as: 'parent', foreignKey: 'parentId' });

User.belongsToMany(Post, { as: 'retweets', through: 'Retweets' });
Post.belongsToMany(User, { as: 'retweetedBy', through: 'Retweets' });

User.hasMany(Message, { as: 'sentMessages', foreignKey: 'senderId' });
User.hasMany(Message, { as: 'receivedMessages', foreignKey: 'recipientId' });
Message.belongsTo(User, { as: 'sender', foreignKey: 'senderId' });
Message.belongsTo(User, { as: 'recipient', foreignKey: 'recipientId' });

module.exports = {
  User,
  Post,
  Message
};