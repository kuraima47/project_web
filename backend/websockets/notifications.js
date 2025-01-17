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

// Exporter la logique pour gérer les notifications
module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('Un utilisateur est connecté pour les notifications :', socket.id);

    const token = socket.handshake.query.token;
    const decoded = verifyToken(socket, token);
    if (!decoded) return;

    // Écouter les événements de notification envoyés par le serveur
    socket.on('sendNotification', (notificationData) => {
      const { type, message } = notificationData;

      console.log(`Envoi de notification à ${socket.userId} : Type: ${type}, Message: ${message}`);

      // Émettre la notification en temps réel pour l'utilisateur
      io.to(socket.userId).emit('receiveNotification', { type, message });
    });

    // Déconnexion de l'utilisateur
    socket.on('disconnect', () => {
      console.log('Un utilisateur s\'est déconnecté des notifications :', socket.id);
    });
  });
};
