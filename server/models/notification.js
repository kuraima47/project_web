// models/notification.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./user');
const Post = require('./post');
const Comment = require('./comment');

const Notification = sequelize.define('Notification', {
    type: {
        type: DataTypes.ENUM('like', 'comment', 'repost', 'follow'), // <-- Ajout "follow"
        allowNull: false,
    },
    read: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
});

Notification.belongsTo(User, { as: 'user', foreignKey: 'userId' });
Notification.belongsTo(User, { as: 'actor', foreignKey: 'actorId' });
Notification.belongsTo(Post, { as: 'post', foreignKey: 'postId' });
Notification.belongsTo(Comment, { as: 'comment', foreignKey: 'commentId' });

module.exports = Notification;
