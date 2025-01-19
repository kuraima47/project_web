const redis = require('redis');
const cron = require('node-cron');
const redisClient = require('./redisClient');

console.log(process.env.NODE_ENV);

// Définir un cache clé
const cacheKey = 'crypto_set';

/**
 * Fonction qui récupère les prix des cryptomonnaies via l'API CoinMarketCap
 * et les stocke dans Redis.
 * 
 * Cette fonction effectue une requête à l'API CoinMarketCap pour obtenir les prix
 * des dernières cryptomonnaies, puis les ajoute à une liste dans Redis sous la clé 
 * définie par `cacheKey`.
 * 
 * En cas d'erreur lors de la récupération des données ou de l'insertion dans Redis, 
 * un message d'erreur est affiché dans la console.
 */
const fetchAndStoreCryptoPrices = async () => {
  try {
    // Effectuer la requête API pour récupérer les données des cryptos
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

    // Ajouter chaque crypto-monnaie dans la liste Redis
    await redisClient.rPush(cacheKey, JSON.stringify(data)); // Ajouter à la fin de la liste

    console.log('Données de crypto-monnaies mises à jour et ajoutées dans la liste Redis.');
  } catch (error) {
    console.error('Erreur lors de la mise à jour des prix des crypto-monnaies :', error);
  }
};

// Planifier la tâche pour qu'elle s'exécute toutes les 5 minutes
cron.schedule('*/5 * * * *', fetchAndStoreCryptoPrices);

/**
 * Fonction pour récupérer les données des dernières cryptomonnaies stockées dans Redis.
 * 
 * Cette fonction vérifie si des données sont présentes en cache (Redis) et renvoie
 * le dernier élément (le plus récent) de la liste de cryptomonnaies. Si aucune donnée 
 * n'est trouvée dans le cache, une erreur est retournée.
 * 
 * @param {Object} req - Requête HTTP.
 * @param {Object} res - Réponse HTTP.
 * @returns {Object} Données des cryptomonnaies en format JSON.
 */
const getCryptoPrices = async (req, res) => {
  try {
    // Récupérer le dernier élément de la liste Redis
    const cachedData = await redisClient.lIndex(cacheKey, -1); // Index -1 pour obtenir le dernier élément
    if (cachedData) {
      // Retourner le dernier élément JSON
      return res.json(JSON.parse(cachedData));
    }

    // Si aucun élément n'est trouvé dans la liste
    return res.status(500).json({ error: 'Aucune donnée en cache disponible' });
  } catch (error) {
    console.error('Erreur lors de la récupération du dernier prix des cryptos :', error);
    return res.status(500).json({ error: 'Erreur interne du serveur' });
  }
};

/**
 * Fonction pour récupérer les données d'une crypto spécifique par son nom.
 * 
 * Cette fonction récupère toutes les cryptomonnaies stockées dans Redis et filtre
 * celles qui correspondent au nom spécifié par l'utilisateur dans l'URL.
 * Si une crypto avec le nom donné est trouvée, elle est renvoyée. Sinon, une erreur 404
 * est retournée.
 * 
 * @param {Object} req - Requête HTTP contenant l'adresse de la crypto à rechercher dans les paramètres.
 * @param {Object} res - Réponse HTTP.
 * @returns {Object} Données de la crypto correspondante en format JSON.
 */
const getCryptoPricesWithName = async (req, res) => {
  try {
    const { cryptoName } = req.params;  // Récupérer le nom de la crypto à partir des paramètres d'URL
    // Récupérer toutes les cryptos depuis la liste Redis
    console.log(cryptoName);
    const cachedData = await redisClient.lRange(cacheKey, 0, -1); // Récupère tous les éléments de la liste

    // Parcourir la liste et trouver la crypto-monnaie avec le nom spécifié
    const crypto = []
    for (let i = 0; i < cachedData.length; i++) {
      const item = JSON.parse(cachedData[i]);
      for (let j = 0; j < item.data.length; j++) {
        if (item.data[j].name === cryptoName) {
          crypto.push(item.data[j]);
        }
      }
    }

    console.log(crypto);
    if (crypto.length) {
      return res.json(crypto); // Retourner la crypto-monnaie trouvée
    } else {
      return res.status(404).json({ error: 'Crypto non trouvée' });
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des prix d\'une crypto :', error);
    return res.status(500).json({ error: 'Erreur interne du serveur' });
  }
};

module.exports = { getCryptoPrices, getCryptoPricesWithName };
