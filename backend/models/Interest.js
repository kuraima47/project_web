// models/interest.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const UserInterest = require('./userInterest');
const User = require('./user');

const Interest = sequelize.define('Interest', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true, // par exemple, un seul "Music" dans la table
    }
}, {
    tableName: 'Interests', // nom de la table si tu veux le préciser
    timestamps: false,      // si tu n’as pas besoin de createdAt/updatedAt
});



Interest.belongsToMany(User, {
    through: UserInterest,
    foreignKey: 'interestId',
    otherKey: 'userId',
    as: 'users',
});


module.exports = Interest;
