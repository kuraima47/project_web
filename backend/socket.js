// socket.js
const { Server } = require('socket.io');
const http = require('http'); // Pour créer un serveur HTTP
let ioMessages; // Déclaration de io mais non initialisé
let ioNotifications;

function initSockets(app) {
    const server = http.createServer(app);
    ioMessages = new Server(server, {
        cors: {
            origin: 'http://localhost:3000',
            methods: ['GET', 'POST'],
            credentials: true,
        },
    });

    const notificationServer = http.createServer(app);
    ioNotifications = new Server(notificationServer, {
        cors: {
            origin: 'http://localhost:3000',
            methods: ['GET', 'POST'],
            credentials: true,
        },
    });
    return {server, notificationServer};
}

// Fonction pour récupérer l'instance io
function getIoMessages() {
  if (!ioMessages) {
    throw new Error('Socket.io is not initialized');
  }
  return ioMessages;
}

function getIoNotifications() {
    if (!ioNotifications) {
      throw new Error('Socket.io is not initialized');
    }
    return ioNotifications;
  }

module.exports = {
  initSockets,
  getIoMessages,
  getIoNotifications
};
