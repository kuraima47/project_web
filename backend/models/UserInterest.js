// models/userInterest.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./user');
const Interest = require('./Interest');

const UserInterest = sequelize.define('UserInterest', {
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,    // référence la table Users
            key: 'id',
        },
    },
    interestId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Interest, // référence la table Interests
            key: 'id',
        },
    },
    score: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,  // On initialise à 0
    },
}, {
    tableName: 'UserInterests',
    timestamps: false,
});

module.exports = UserInterest;