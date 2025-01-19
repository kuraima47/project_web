const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const Conversation = require('../models/conversation');
const secretKey = process.env.JWT_SECRET || 'jwt_secret_key';

// Pour gérer le cooldown entre l'envoi de messages
const messageCooldowns = {};

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
    console.log('Token manquant !');
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

/**
 * Vérifie si l'utilisateur a accès à une conversation spécifique identifiée par `roomId`.
 * 
 * @param {Socket} socket - L'objet socket associé à la connexion.
 * @param {number} roomId - L'ID de la conversation (room).
 * @returns {boolean} - Retourne true si l'utilisateur a accès, sinon false.
 */
async function checkConversationAccess(socket, roomId) {
  // Par exemple, roomId == -1 peut être un chat global (optionnel)
  if (roomId === -1) {
    console.log(`Utilisateur ${socket.userId} a rejoint la room globale : ${roomId}`);
    socket.join(roomId);
    return true;
  }

  // On vérifie si la conversation existe et appartient à l'utilisateur
  const conversation = await Conversation.findOne({
    where: {
      id: roomId,
      [Op.or]: [{ senderId: socket.userId }, { receiverId: socket.userId }],
    },
  });

  if (!conversation) {
    console.log(`Utilisateur ${socket.userId} n'a pas accès à la conversation ${roomId}`);
    socket.disconnect(); // ou socket.emit("error", "No access")
    return false;
  }

  console.log(`Socket ${socket.id} a rejoint la conversation ${roomId}`);
  socket.join(roomId);
  return true;
}

/**
 * Gère la vérification du cooldown et de la taille du message avant son envoi.
 * 
 * @param {Socket} socket - L'objet socket associé à la connexion.
 * @param {Object} message - L'objet message envoyé par l'utilisateur.
 * @param {string} message.content - Le contenu du message.
 * @returns {boolean} - Retourne true si le message est valide et peut être envoyé, sinon false.
 */
function handleMessageCooldown(socket, message) {
  const currentTime = Date.now();

  // Vérification de la taille du message
  if (message.content.length > 120) {
    socket.emit('receiveMessageError', {
      error: "Le message ne peut pas dépasser 120 caractères.",
    });
    return false;
  }

  // Vérification du cooldown de 10 secondes
  if (
      messageCooldowns[socket.userId] &&
      (currentTime - messageCooldowns[socket.userId]) < 10000
  ) {
    socket.emit('receiveMessageError', {
      error: "Veuillez attendre 10 secondes avant d'envoyer un autre message.",
    });
    return false;
  }

  // Met à jour le timestamp du dernier message pour cet utilisateur
  messageCooldowns[socket.userId] = currentTime;
  return true;
}

/**
 * Gère les connexions, les événements de messages et la gestion des conversations.
 * 
 * @param {Server} io - L'instance du serveur Socket.io.
 */
module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('Un utilisateur est connecté :', socket.id);

    // 1. Vérification du token
    const token = socket.handshake.query.token;
    const decoded = verifyToken(socket, token);
    if (!decoded) return; // Si token invalide, on a déjà déconnecté.

    // 2. Écouter l'événement "listenMyRooms"
    socket.on('listenMyRooms', async () => {
      try {
        // Récupérer toutes les conversations de l'utilisateur
        const convs = await Conversation.findAll({
          attributes: ['id'],
          where: {
            [Op.or]: [
              { senderId: socket.userId },
              { receiverId: socket.userId },
            ],
          },
        });

        // Le socket rejoint toutes les rooms correspondantes
        convs.forEach((conv) => {
          socket.join(conv.id);
        });

        console.log(
            `User ${socket.userId} a rejoint ${convs.length} rooms via "listenMyRooms".`
        );
      } catch (error) {
        console.error(
            `Erreur lors de l'inscription aux rooms pour l'utilisateur ${socket.userId}:`,
            error
        );
      }
    });

    // 3. Rejoindre une room précise (conversation)
    socket.on('joinRoom', async (roomId) => {
      const hasAccess = await checkConversationAccess(socket, roomId);
      io.to(roomId).emit("refresh");
      if (!hasAccess) return;
    });

    // 4. Écouter l'événement "sendMessage"
    socket.on('sendMessage', (messageData) => {
      const { roomId, message } = messageData;

      if(roomId == -1)
        if (!handleMessageCooldown(socket, message)) return;

      console.log(`Message reçu pour la salle ${roomId}:`, message);

      // On diffuse à tous les sockets de la room
      io.to(roomId).emit('receiveMessage', message);
    });

    socket.on('newConversation', async (conversationData) => {
      try {
        io.emit('receiveNewConversation', conversationData);
      } catch (error) {
        console.error('Erreur création conversation:', error);
        socket.emit('receiveMessageError', {
          error: "Impossible de créer la conversation",
        });
      }
    });

    socket.on('disconnect', () => {
      console.log('Un utilisateur s\'est déconnecté :', socket.id);
    });
  });
};
