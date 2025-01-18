const jwt = require('jsonwebtoken');
const secretKey = process.env.JWT_SECRET || 'jwt_secret_key';

// Fonction pour vérifier le token d'un utilisateur
function verifyToken(socket, token) {
  if (!token) {
    console.log('Token manquant!');
    socket.disconnect();
    return null;
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    socket.userId = decoded.id;
    console.log(`Utilisateur vérifié pour notification : ${socket.userId}`);
    return decoded;
  } catch (error) {
    console.log('Token invalide ou expiré pour notification');
    socket.disconnect();
    return null;
  }
}

const userSocketMap = new Map();
// Exporter la logique pour gérer les notifications
module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log("tentative de connexion websocket notif....");
    const token = socket.handshake.query.token;
    const decoded = verifyToken(socket, token);
    if (!decoded) {
      console.log("déconnecté, mauvais token");
      socket.disconnect();
      return;
    }

    const socketId = socket.id;
    const userId = decoded.id;
    console.log('Un utilisateur est connecté pour les notifications :', socketId);
    addUserToSocketMap(userId, socketId);

    // Déconnexion de l'utilisateur
    socket.on('disconnect', () => {
      console.log('Un utilisateur s\'est déconnecté des notifications :', socketId);
      removeUserFromSocketMap(userId);
    });
  });
};


function addUserToSocketMap(userId, socketId) {
  userSocketMap.set(userId, socketId);
  console.log(`Ajouté à la table de hachage : ${userId} -> ${socketId}`);
}

// Fonction pour supprimer l'association user.id -> socket.id
function removeUserFromSocketMap(userId) {
  userSocketMap.delete(userId);
  console.log(`Supprimé de la table de hachage : ${userId}`);
}

function getSocketIdFromUserId(userId) {
  return userSocketMap.get(userId);
}

module.exports.getSocketIdFromUserId = getSocketIdFromUserId;

