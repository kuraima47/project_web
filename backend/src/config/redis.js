const redis = require('redis');
require('dotenv').config();

const client = redis.createClient({
  url: process.env.REDIS_URL_TW || 'redis://localhost:6379',
});

client.on('connect', () => {
  console.log('Connected to Redis');
});

client.on('error', (err) => {
  console.error('Redis error:', err);
});

client.connect().catch((err) => {
  console.error('Error connecting to Redis:', err);
});

module.exports = client;