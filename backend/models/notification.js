// models/notification.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./user');
const Post = require('./post');

const Notification = sequelize.define('Notification', {
    type: {
        type: DataTypes.ENUM('like', 'comment', 'repost', 'follow', 'unfollow'), // <-- Ajout "follow"
        allowNull: false,
    },
    read: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
});


module.exports = Notification;
