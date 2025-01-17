const jwt = require('jsonwebtoken');
const Conversation = require('./models/conversation');
const { Op } = require('sequelize');
const secretKey = process.env.JWT_SECRET || 'jwt_secret_key';

// Pour gérer le cooldown
const messageCooldowns = {};

function verifyToken(socket, token) {
  if (!token) {
    console.log('Token manquant!');
    socket.disconnect();
    return null;
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    socket.userId = decoded.id;
    console.log(`Utilisateur vérifié : ${socket.userId}`);
    return decoded;
  } catch (error) {
    console.log('Token invalide ou expiré');
    socket.disconnect();
    return null;
  }
}

async function checkConversationAccess(socket, roomId) {
  if (roomId === -1) {
    console.log(`Utilisateur ${socket.userId} a rejoint la room ${roomId}`);
    socket.join(roomId);
    return true;
  }

  const conversation = await Conversation.findOne({
    where: {
      id: roomId,
      [Op.or]: [{ senderId: socket.userId }, { receiverId: socket.userId }],
    },
  });

  if (!conversation) {
    console.log(`Utilisateur ${socket.userId} n'a pas accès à la conversation ${roomId}`);
    socket.disconnect();
    return false;
  }

  console.log(`Socket ${socket.id} a rejoint la salle ${roomId}`);
  socket.join(roomId);
  return true;
}

function handleMessageCooldown(socket, message) {
  const currentTime = Date.now();
  if (message.content.length > 120) {
    socket.emit('receiveMessageError', { error: "Le message ne peut pas dépasser 120 caractères." });
    return false;
  }

  if (messageCooldowns[socket.userId] && (currentTime - messageCooldowns[socket.userId]) < 10000) {
    socket.emit('receiveMessageError', { error: "Veuillez attendre 10 secondes avant d'envoyer un autre message." });
    return false;
  }

  messageCooldowns[socket.userId] = currentTime;
  return true;
}

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('Un utilisateur est connecté :', socket.id);
    
    const token = socket.handshake.query.token;
    const decoded = verifyToken(socket, token);
    if (!decoded) return;  // Déconnecter si le token est invalide ou expiré

    // Rejoindre une room
    socket.on('joinRoom', async (roomId) => {
      const hasAccess = await checkConversationAccess(socket, roomId);
      if (!hasAccess) return; // Si l'accès à la conversation est refusé, déconnecter
    });

    // Envoi de message
    socket.on('sendMessage', (messageData) => {
      const { roomId, message } = messageData;

      if (roomId < 0 && !handleMessageCooldown(socket, message)) return; // Vérifier le cooldown et la longueur du message

      console.log(`Message reçu pour la salle ${roomId}:`, message);
      io.to(roomId).emit('receiveMessage', message); // Diffuser le message à la room
    });

    // Déconnexion
    socket.on('disconnect', () => {
      console.log('Un utilisateur s\'est déconnecté :', socket.id);
    });
  });
};
