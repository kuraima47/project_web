// middlewares/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/user');

exports.authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization header missing or invalid' });
    }

    // Extraire le token
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Token not found' });
    }

    // Vérification du token
    const secretKey = process.env.JWT_SECRET || 'jwt_secret_key';
    const decoded = jwt.verify(token, secretKey);

    // Vérifier si on a bien un id dans le payload
    if (!decoded || !decoded.id) {
      return res.status(401).json({ error: 'Invalid token payload' });
    }

    // Récupérer l'utilisateur correspondant
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Ajouter l’utilisateur à req
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};
