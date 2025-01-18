// models/user.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Import du modèle de jointure
const UserFollows = require('./userFollow');
const UserInterest = require('./userInterest');
const Interest = require('./interest');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },
  avatar: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
});

// --- Relation Follows ---
/**
 * "followers" : liste des utilisateurs QUI suivent CE user
 * => Sur la table UserFollows, CE user est `followingId`.
 */
User.belongsToMany(User, {
  as: 'followers',
  through: UserFollows,
  foreignKey: 'followingId',   // la colonne dans UserFollows
  otherKey: 'followerId',      // l'autre colonne
});

/**
 * "following" : liste des utilisateurs que CE user SUIT
 * => Sur la table UserFollows, CE user est `followerId`.
 */
User.belongsToMany(User, {
  as: 'following',
  through: UserFollows,
  foreignKey: 'followerId',
  otherKey: 'followingId',
});


User.belongsToMany(Interest, {
  through: UserInterest,
  foreignKey: 'userId',
  otherKey: 'interestId',
  as: 'interests',
});

module.exports = User;
