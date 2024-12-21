// index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const sequelize = require('./config/database');

// Import des routes
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const searchRoutes = require('./routes/searchRoutes');

// Import des modèles pour faire le sync
const User = require('./models/user');
const UserFollows = require('./models/userFollow');  // La table de follow
const Post = require('./models/post');
const Comment = require('./models/comment');
const Notification = require('./models/notification');
const Hashtag = require('./models/hashtag');

// (Optionnel) belongsToMany pour Like — si tu veux créer la table PostLikes
// Post.belongsToMany(User, { through: 'PostLikes', as: 'likedBy' });
// User.belongsToMany(Post, { through: 'PostLikes', as: 'likedPosts' });

const app = express();
const port = process.env.PORT || 3001;

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/search', searchRoutes);

// Sync all models
sequelize.sync({ alter: true }).then(() => {
  console.log('Database synced');
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
});
