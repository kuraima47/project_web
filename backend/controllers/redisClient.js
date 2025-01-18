const { createClient } = require('@redis/client');

let redisClient;

(async () => {
  try {
    if (!redisClient) {
      redisClient = createClient({
        socket: {
          host: process.env.NODE_ENV === 'production' ? 'redis' : '127.0.0.1',
          port: 6379,
        },
      });

      await redisClient.connect();
      console.log('Connexion à Redis réussie');
    }
  } catch (error) {
    console.error('Erreur lors de la connexion à Redis :', error);
    process.exit(1);
  }
})();

module.exports = redisClient;
