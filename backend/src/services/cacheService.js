const redis = require('redis');
require('dotenv').config();

const client = redis.createClient({
  url: process.env.REDIS_URL_TW || 'redis://localhost:6379',
});

client.on('error', (err) => {
  console.error('Redis error:', err);
});

client.connect();

module.exports = {
  async set(key, value, expirationInSeconds) {
    try {
      await client.set(key, JSON.stringify(value), {
        EX: expirationInSeconds,
      });
    } catch (error) {
      console.error('Error setting cache:', error);
    }
  },

  async get(key) {
    try {
      const value = await client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Error getting cache:', error);
      return null;
    }
  },

  async delete(key) {
    try {
      await client.del(key);
    } catch (error) {
      console.error('Error deleting cache:', error);
    }
  },
};