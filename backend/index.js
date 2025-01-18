require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io'); // Importer Socket.IO
const path = require('path');
const sequelize = require('./config/database');

// Import des routes
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const searchRoutes = require('./routes/searchRoutes');
const messageRoutes = require('./routes/messageRoutes');
const cryptoRoutes = require('./routes/cryptoRoutes');
const pixelWarRoutes = require('./routes/pixelWarRoutes');

// Import des modèles
const User = require('./models/user');
const UserFollows = require('./models/userFollow');
const Post = require('./models/post');
const Notification = require('./models/notification');
const Hashtag = require('./models/hashtag');
const feedRoutes = require('./routes/feedRoutes');

const app = express();


// Sockets
const { initSockets, getIoMessages, getIoNotifications, getIoPixelWar } = require('./socket');
const {server, notificationServer, pixelwarServer} = initSockets(app);

require('./websockets/messages.js')(getIoMessages()); // WebSocket pour les messages privés
require('./websockets/notifications.js')(getIoNotifications());
require('./websockets/pixelwar.js')(getIoPixelWar());

// Configuration CORS
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/cryptos', cryptoRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/pixels', pixelWarRoutes);
app.use('/api/feed', feedRoutes);

// Sync des modèles et démarrage du serveur
sequelize.sync({ alter: true }).then(() => {
  console.log('Database synced');
  server.listen(3001, () => {
    console.log(`Server running on port 3001`);
  });
  notificationServer.listen(3002, () => {
    console.log(`Notification WebSocket server running on port 3002`);
  });

  pixelwarServer.listen(3003, () => {
    console.log(`PixelWar WebSocket server running on port 3003`);
  })
});
