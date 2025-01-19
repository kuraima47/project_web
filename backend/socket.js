/**
 * Gestion des sockets avec Socket.IO.
 * Ce fichier configure plusieurs instances Socket.IO pour les messages, notifications, et PixelWar.
 * Il expose des méthodes pour initialiser les sockets et récupérer leurs instances.
 */

const { Server } = require('socket.io');
const http = require('http'); // Pour créer un serveur HTTP

// Déclaration des instances de Socket.IO mais non initialisées
let ioMessages;
let ioNotifications;
let ioPixelWar;

/**
 * Initialise les serveurs Socket.IO pour les différents modules de l'application.
 * @param {object} app - L'application Express utilisée pour créer les serveurs HTTP.
 * @returns {object} - Les serveurs HTTP associés aux sockets (messages, notifications, PixelWar).
 */
function initSockets(app) {
    // Serveur principal pour les messages
    const server = http.createServer(app);
    ioMessages = new Server(server, {
        cors: {
            origin: 'http://localhost:3000', // Origine autorisée pour les requêtes CORS
            methods: ['GET', 'POST'], // Méthodes HTTP autorisées
            credentials: true, // Autorisation des cookies et en-têtes d'identification
        },
    });

    // Serveur pour les notifications
    const notificationServer = http.createServer(app);
    ioNotifications = new Server(notificationServer, {
        cors: {
            origin: 'http://localhost:3000',
            methods: ['GET', 'POST'],
            credentials: true,
        },
    });

    // Serveur pour PixelWar
    const pixelwarServer = http.createServer(app);
    ioPixelWar = new Server(pixelwarServer, {
        cors: {
            origin: 'http://localhost:3000',
            methods: ['GET', 'POST'],
            credentials: true,
        },
    });

    // Retourne les serveurs créés pour être utilisés ailleurs dans l'application
    return { server, notificationServer, pixelwarServer };
}

/**
 * Récupère l'instance Socket.IO pour les messages.
 * @throws {Error} Si l'instance n'a pas été initialisée.
 * @returns {object} - L'instance Socket.IO des messages.
 */
function getIoMessages() {
    if (!ioMessages) {
        throw new Error('Socket.io is not initialized');
    }
    return ioMessages;
}

/**
 * Récupère l'instance Socket.IO pour PixelWar.
 * @throws {Error} Si l'instance n'a pas été initialisée.
 * @returns {object} - L'instance Socket.IO de PixelWar.
 */
function getIoPixelWar() {
    if (!ioPixelWar) {
        throw new Error('Socket.io is not initialized');
    }
    return ioPixelWar;
}

/**
 * Récupère l'instance Socket.IO pour les notifications.
 * @throws {Error} Si l'instance n'a pas été initialisée.
 * @returns {object} - L'instance Socket.IO des notifications.
 */
function getIoNotifications() {
    if (!ioNotifications) {
        throw new Error('Socket.io is not initialized');
    }
    return ioNotifications;
}

// Exportation des fonctions pour les utiliser dans d'autres fichiers
module.exports = {
    initSockets,
    getIoMessages,
    getIoPixelWar,
    getIoNotifications
};
