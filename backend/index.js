/**
 * Configuration principale du serveur.
 * Ce fichier configure et démarre un serveur Express avec plusieurs fonctionnalités,
 * y compris les routes API, la gestion des websockets, et la synchronisation avec une base de données Sequelize.
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io'); // Importer Socket.IO
const path = require('path');
const sequelize = require('./config/database');

// Import des routes
const userRoutes = require('./routes/userRoutes'); // Routes liées aux utilisateurs
const postRoutes = require('./routes/postRoutes'); // Routes liées aux publications
const notificationRoutes = require('./routes/notificationRoutes'); // Routes pour les notifications
const searchRoutes = require('./routes/searchRoutes'); // Routes pour la recherche
const messageRoutes = require('./routes/messageRoutes'); // Routes pour les messages
const cryptoRoutes = require('./routes/cryptoRoutes'); // Routes pour les cryptomonnaies
const pixelWarRoutes = require('./routes/pixelWarRoutes'); // Routes pour le jeu PixelWar
const feedRoutes = require('./routes/feedRoutes'); // Routes pour le fil d'actualité
const eastereggRoutes = require('./routes/easterEggRoutes'); // Routes pour l'easter egg

// Import des modèles
const User = require('./models/user'); // Modèle utilisateur
const UserFollows = require('./models/userFollow'); // Modèle pour les relations utilisateur (suivi)
const UserInterest = require('./models/userInterest'); // Modèle pour les intérêts utilisateur
const Interest = require('./models/interest'); // Modèle pour les intérêts
const Post = require('./models/post'); // Modèle pour les publications
const Notification = require('./models/notification'); // Modèle pour les notifications
const Hashtag = require('./models/hashtag'); // Modèle pour les hashtags

const app = express();

/**
 * Initialisation des sockets.
 * Les sockets permettent une communication bidirectionnelle en temps réel entre le serveur et les clients.
 */
const { initSockets, getIoMessages, getIoNotifications, getIoPixelWar } = require('./socket');
const { server, notificationServer, pixelwarServer } = initSockets(app);

// Initialisation des websockets pour différents services
require('./websockets/messages.js')(getIoMessages()); // WebSocket pour les messages privés
require('./websockets/notifications.js')(getIoNotifications()); // WebSocket pour les notifications
require('./websockets/pixelwar.js')(getIoPixelWar()); // WebSocket pour PixelWar

/**
 * Configuration de CORS.
 * Permet de gérer les requêtes provenant d'origines différentes (Cross-Origin Resource Sharing).
 */
app.use(cors({
  origin: 'http://localhost:3000', // Origine autorisée
  credentials: true
}));

// Middleware pour parser le JSON
app.use(express.json());

/**
 * Configuration des fichiers statiques.
 * Permet de servir les fichiers dans le dossier "uploads".
 */
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/**
 * Définition des routes API.
 */
app.use('/api/cryptos', cryptoRoutes); // Routes liées aux cryptomonnaies
app.use('/api/users', userRoutes); // Routes liées aux utilisateurs
app.use('/api/posts', postRoutes); // Routes pour les publications
app.use('/api/notifications', notificationRoutes); // Routes pour les notifications
app.use('/api/search', searchRoutes); // Routes pour la recherche
app.use('/api/messages', messageRoutes); // Routes pour les messages privés
app.use('/api/pixels', pixelWarRoutes); // Routes pour le jeu PixelWar
app.use('/api/feed', feedRoutes); // Routes pour le fil d'actualité
app.use('/api/easterEgg', eastereggRoutes); // Routes pour l'easter egg

/**
 * Synchronisation des modèles Sequelize et démarrage des serveurs.
 * Trois serveurs sont démarrés :
 * - Serveur principal sur le port 3001
 * - Serveur WebSocket pour les notifications sur le port 3002
 * - Serveur WebSocket pour PixelWar sur le port 3003
 */
sequelize.sync({ alter: true }).then(() => {
  console.log('Database synced');

  // Démarrage du serveur principal
  server.listen(3001, () => {
    console.log(`Server running on port 3001`);
  });

  // Démarrage du serveur de notifications
  notificationServer.listen(3002, () => {
    console.log(`Notification WebSocket server running on port 3002`);
  });

  // Démarrage du serveur PixelWar
  pixelwarServer.listen(3003, () => {
    console.log(`PixelWar WebSocket server running on port 3003`);
  });
});
