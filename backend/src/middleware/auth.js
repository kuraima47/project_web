const jwt = require('jsonwebtoken');
const { User } = require('../models');
require('dotenv').config();

const authMiddleware = async (req, res, next) => {
  try {
    let token;

    // Vérifie si le token est présent dans l'en-tête Authorization
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Si aucun token n'est présent, renvoie une erreur
    console.log(token);

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token provided' });
    }


    console.log(process.env.JWT_SECRET_TW);
    console.log(token);

    // Vérifie et décode le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET_TW);

    console.log("decoded:"+decoded);

    // Récupère l'utilisateur correspondant au token

    

    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User not found, invalid token' });
    }

    // Stocke l'utilisateur dans la requête pour les prochaines middlewares/routes
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ message: 'Not authorized, token verification failed' });
  }
};

module.exports = authMiddleware;
