const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const Conversation = require('../models/conversation');
const secretKey = process.env.JWT_SECRET || 'jwt_secret_key';

// Pour gérer le cooldown entre l'envoi de messages
const messageCooldowns = {};

/**
 * Vérifie et décode le token JWT,
 * puis fixe `socket.userId` si tout est OK.
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
 * Vérifie si l'utilisateur (socket.userId) a accès
 * à la conversation `roomId`.
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
 * Gère la vérification du cooldown et de la taille du message.
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

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('Un utilisateur est connecté :', socket.id);

    // 1. Vérification du token
    const token = socket.handshake.query.token;
    const decoded = verifyToken(socket, token);
    if (!decoded) return; // Si token invalide, on a déjà déconnecté.

    // 2. Écouter l'événement "listenMyRooms"
    //    (Par exemple, dans ton front, tu fais socket.emit("listenMyRooms")
    //     après s'être connecté)
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
    //    (Dans ta page /messages/[id], tu fais socket.emit("joinRoom", conversationId))
    socket.on('joinRoom', async (roomId) => {
      const hasAccess = await checkConversationAccess(socket, roomId);
      if (!hasAccess) return;
    });

    // 4. Écouter l'événement "sendMessage"
    //    => le front envoie { roomId, message }
    //    => on vérifie accès / cooldown / etc.
    //    => on émet 'receiveMessage' dans la room
    socket.on('sendMessage', (messageData) => {
      const { roomId, message } = messageData;

      // Si tu veux appliquer le cooldown seulement sur une room globale :
      // if (roomId < 0 && !handleMessageCooldown(socket, message)) return;

      // Si tu veux l'appliquer sur toutes les conversations, supprime la condition :
      if (!handleMessageCooldown(socket, message)) return;

      console.log(`Message reçu pour la salle ${roomId}:`, message);

      // On diffuse à tous les sockets de la room
      io.to(roomId).emit('receiveMessage', message);
    });

    /**
     * 5. Création d'une conversation (OPTIONNEL)
     *    -> soit tu la crées côté front en faisant un fetch vers ton API REST
     *    -> soit tu peux aussi créer côté socket si tu veux
     *
     *    Imaginons que le front émet "newConversation" avec
     *    { participants: [...], etc. } quand tu cliques sur "Démarrer"
     */
    socket.on('newConversation', async (conversationData) => {
      try {
        // Exemple: on crée la conversation en base
        // conversationData = { senderId, receiverId, ... }
        const newConv = await Conversation.create(conversationData);

        // On met éventuellement l'utilisateur dans la room
        socket.join(newConv.id);

        // Puis on informe le client qu'une nouvelle conversation est créée
        // (soit seulement l'utilisateur, soit tous tes sockets, etc.)
        // Ici, je l'envoie à l'utilisateur courant, mais tu peux faire un "io.emit"
        // si tu veux que tous les utilisateurs voient la nouvelle conversation.
        socket.emit('receiveNewConversation', newConv);
        console.log('Nouvelle conversation créée : ', newConv.id);
      } catch (error) {
        console.error('Erreur création conversation:', error);
        socket.emit('receiveMessageError', {
          error: "Impossible de créer la conversation",
        });
      }
    });

    // 6. Déconnexion
    socket.on('disconnect', () => {
      console.log('Un utilisateur s\'est déconnecté :', socket.id);
    });
  });
};
