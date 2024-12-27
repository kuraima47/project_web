const jwt = require('jsonwebtoken');
const Conversation = require('./models/conversation'); // Importez vos modèles comme nécessaire
const secretKey = process.env.JWT_SECRET || 'jwt_secret_key';
const { Op } = require('sequelize');

// Pour gérer le cooldown
const messageCooldowns = {}; // Stockera le timestamp du dernier message par utilisateur

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('Un utilisateur est connecté :', socket.id);

    // Récupérer le token d'authentification depuis le client (via la query)
    const token = socket.handshake.query.token;

    if (!token) {
      console.log('Token manquant!');
      return socket.disconnect();
    }

    try {
      // Vérifier le token
      const decoded = jwt.verify(token, secretKey);
      socket.userId = decoded.id;
      console.log(`Utilisateur vérifié : ${socket.userId}`);

      // Vérifier si l'utilisateur a accès à la conversation spécifique
      socket.on('joinRoom', async (roomId) => {
        if (roomId === -1) {
          // Permettre à tous d'accéder à la room -1 sans authentification supplémentaire
          console.log(`Utilisateur ${socket.userId} a rejoint la room ${roomId}`);
          socket.join(roomId);
        } else {
          const conversation = await Conversation.findOne({
            where: {
              id: roomId,
              [Op.or]: [{ senderId: socket.userId }, { receiverId: socket.userId }],
            },
          });

          if (!conversation) {
            console.log(`Utilisateur ${socket.userId} n'a pas accès à la conversation ${roomId}`);
            return socket.disconnect(); // Déconnecter si l'utilisateur n'a pas accès
          }

          console.log(`Socket ${socket.id} a rejoint la salle ${roomId}`);
          socket.join(roomId); // L'utilisateur peut rejoindre la room s'il est autorisé
        }
      });

      // Gestion de l'envoi de message
      socket.on('sendMessage', (messageData) => {
        const { roomId, message } = messageData;
        if(roomId <0) {
          // Vérifier si le message dépasse 120 caractères
          if (message.content.length > 120) {
            socket.emit('receiveMessageError', { error: "Le message ne peut pas dépasser 120 caractères." });
            return;
          }

          const currentTime = Date.now();

          // Vérifier le cooldown (10 secondes)
          if (messageCooldowns[socket.userId] && (currentTime - messageCooldowns[socket.userId]) < 10000) {
            socket.emit('receiveMessageError', { error: "Veuillez attendre 10 secondes avant d'envoyer un autre message." });
            return;
          }

          // Mettre à jour le dernier message envoyé
          messageCooldowns[socket.userId] = currentTime;
        }
        console.log(`Message reçu pour la salle ${roomId}:`, message);

        // Diffuser uniquement aux utilisateurs dans la salle
        io.to(roomId).emit('receiveMessage', message);
      });

      // Déconnexion
      socket.on('disconnect', () => {
        console.log('Un utilisateur s\'est déconnecté :', socket.id);
      });

    } catch (error) {
      console.log('Token invalide ou expiré');
      return socket.disconnect(); // Déconnecter si le token est invalide
    }
  });
};
