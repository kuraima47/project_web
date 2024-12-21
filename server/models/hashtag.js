// models/hashtag.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Hashtag = sequelize.define('Hashtag', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
});

module.exports = Hashtag;
