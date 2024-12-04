// File: backend/src/app.js
const express = require('express');
const redis = require('redis');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { errorHandler } = require('./middleware/errorHandler');
const sequelize = require('./config/database');
const models = require('./models');
require('dotenv').config();

const profileRoutes = require('./routes/profile');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const postRoutes = require('./routes/posts');
const messageRoutes = require('./routes/messages');

const app = express();

// Connect to PostgreSQL
sequelize.authenticate()
  .then(() => console.log('Connected to PostgreSQL'))
  .catch(err => console.error('Unable to connect to the database:', err));

// Sync all models
sequelize.sync({ alter: true })
  .then(() => console.log('Database & tables created!'));

// Connect to Redis
const redisClient = redis.createClient(process.env.REDIS_URL_TW);
redisClient.on('error', (err) => console.log('Redis Client Error', err));

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100 
});
app.use(limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/profile', profileRoutes);

// Error handling middleware
app.use(errorHandler);

module.exports = app;