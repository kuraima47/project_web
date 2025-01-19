// config/database.js
const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config();


const schema = 'public';
const isProduction = process.env.NODE_ENV === 'production';

let sequelize;

if (isProduction) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      logging: false,
      pool: {
          max: 10,
          min: 0,
          acquire: 30000,
          idle: 3000,
      },
  });
} else {
  sequelize = new Sequelize(
            process.env.DB_NAME_PROJET,
            process.env.DB_USER_PROJET,
            process.env.DB_PASSWORD_PROJET,
            {
                host: process.env.DB_HOST_PROJET,
                dialect: 'postgres',
                logging: false,
                define: {
                    schema, 
                },
            }
        );
}

module.exports = sequelize;