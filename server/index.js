require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http'); // Pour créer un serveur HTTP
const { Server } = require('socket.io'); // Importer Socket.IO
const path = require('path');
const sequelize = require('./config/database');

// Import des routes
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const searchRoutes = require('./routes/searchRoutes');
const messageRoutes = require('./routes/messageRoutes');

// Import des modèles
const User = require('./models/user');
const UserFollows = require('./models/userFollow');
const Post = require('./models/post');
const Comment = require('./models/comment');
const Notification = require('./models/notification');
const Hashtag = require('./models/hashtag');

const app = express();
const port = process.env.PORT || 3001;



// Serveur HTTP pour Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});
require('./websocket.js')(io);

// Configuration CORS
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/messages', messageRoutes);

// Sync des modèles et démarrage du serveur
sequelize.sync({ alter: true }).then(() => {
  console.log('Database synced');
  server.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
});
