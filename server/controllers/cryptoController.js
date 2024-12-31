const redis = require('redis');
const cron = require('node-cron');

// Créez un client Redis
const redisClient = redis.createClient();
redisClient.connect();

// Définir un cache clé
const cacheKey = 'crypto_prices';

// Fonction qui récupère les prix des cryptomonnaies
const fetchAndStoreCryptoPrices = async () => {
  try {
    // Effectuer la requête API
    const response = await fetch('https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest', {
      headers: {
        'X-CMC_PRO_API_KEY': '5b8df86d-6cb7-42e0-a28d-926b67677092',
      },
    });

    if (!response.ok) {
      console.error('Erreur lors de la récupération des données depuis CoinMarketCap');
      return;
    }

    const data = await response.json();

    // Stocker les données dans Redis
    await redisClient.set(cacheKey, JSON.stringify(data), {
      EX: 600, // Expiration des données au bout de 10 minutes
    });

    console.log('Données de crypto-monnaies mises à jour dans le cache.');
  } catch (error) {
    console.error('Erreur lors de la mise à jour des prix des crypto-monnaies :', error);
  }
};

// Planifier la tâche pour qu'elle s'exécute toutes les 5 minutes
cron.schedule('*/5 * * * *', fetchAndStoreCryptoPrices);

// Fonction pour récupérer les données de toutes les cryptos
const getCryptoPrices = async (req, res) => {
  try {
    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
      return res.json(JSON.parse(cachedData));
    }

    res.status(500).json({ error: 'Aucune donnée en cache disponible' });
  } catch (error) {
    console.error('Erreur lors de la récupération des prix des cryptos :', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
};

// Fonction pour récupérer les données d'une crypto spécifique par ID
const getCryptoPricesWithId = async (req, res) => {
  try {
    const { id } = req.params;

    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
      const allCryptos = JSON.parse(cachedData);
      const crypto = allCryptos.data.find(crypto => crypto.id === parseInt(id));

      if (crypto) {
        return res.json(crypto);
      } else {
        return res.status(404).json({ error: 'Crypto non trouvée' });
      }
    }

    res.status(500).json({ error: 'Aucune donnée en cache disponible' });
  } catch (error) {
    console.error('Erreur lors de la récupération des prix d\'une crypto :', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
};

module.exports = { getCryptoPrices, getCryptoPricesWithId };
