const jwt = require('jsonwebtoken');
const secretKey = process.env.JWT_SECRET || 'jwt_secret_key';

/**
 * Vérifie et décode le token JWT envoyé par l'utilisateur,
 * puis définit `socket.userId` si le token est valide.
 * 
 * @param {Socket} socket - L'objet socket associé à la connexion.
 * @param {string} token - Le token JWT à vérifier.
 * @returns {Object|null} - Les informations décodées du token si valide, sinon null.
 */
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

/**
 * Gère la logique des notifications en s'assurant de la connexion des utilisateurs
 * et de l'association de leurs sockets à leurs identifiants utilisateur.
 * 
 * @param {Server} io - L'instance du serveur Socket.io.
 */
module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log("tentative de connexion websocket notif....");

    // Récupérer et vérifier le token
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

    // Ajouter l'utilisateur à la map des sockets
    addUserToSocketMap(userId, socketId);

    // Déconnexion de l'utilisateur
    socket.on('disconnect', () => {
      console.log('Un utilisateur s\'est déconnecté des notifications :', socketId);
      removeUserFromSocketMap(userId);
    });
  });
};

/**
 * Ajoute l'association entre l'identifiant utilisateur et le socket à la table de hachage.
 * 
 * @param {string} userId - L'identifiant de l'utilisateur.
 * @param {string} socketId - L'identifiant du socket de l'utilisateur.
 */
function addUserToSocketMap(userId, socketId) {
  userSocketMap.set(userId, socketId);
  console.log(`Ajouté à la table de hachage : ${userId} -> ${socketId}`);
}

/**
 * Supprime l'association entre l'identifiant utilisateur et le socket de la table de hachage.
 * 
 * @param {string} userId - L'identifiant de l'utilisateur à supprimer.
 */
function removeUserFromSocketMap(userId) {
  userSocketMap.delete(userId);
  console.log(`Supprimé de la table de hachage : ${userId}`);
}

/**
 * Récupère l'identifiant du socket associé à un identifiant utilisateur.
 * 
 * @param {string} userId - L'identifiant de l'utilisateur.
 * @returns {string|null} - L'identifiant du socket associé, ou null si l'utilisateur n'est pas trouvé.
 */
function getSocketIdFromUserId(userId) {
  return userSocketMap.get(userId);
}

module.exports.getSocketIdFromUserId = getSocketIdFromUserId;
