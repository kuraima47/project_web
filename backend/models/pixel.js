// models/pixel.js
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Pixel extends Model {}

Pixel.init(
  {
    x: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    y: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    color: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'Pixel',
  }
);

module.exports = Pixel;
