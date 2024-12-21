// models/userFollow.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Table de jointure qui associe "followerId" et "followingId".
 * - followerId : l'utilisateur QUI suit
 * - followingId : l'utilisateur QUI est suivi
 */
const UserFollows = sequelize.define('UserFollows', {
    // Optionnel : si tu veux stocker la date de follow, tu peux l’ajouter
    // followedAt: {
    //   type: DataTypes.DATE,
    //   defaultValue: DataTypes.NOW,
    // }
}, {
    tableName: 'UserFollows', // Nom de la table si tu veux l'imposer
    timestamps: false,        // Pas de createdAt, updatedAt si tu ne veux pas
});

module.exports = UserFollows;
