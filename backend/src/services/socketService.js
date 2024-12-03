const { Server } = require('socket.io');
let io;
require('dotenv').config();

module.exports = {
  init(httpServer) {
    io = new Server(httpServer, {
      cors: {
        origin: process.env.CLIENT_URL_TW || 'http://localhost:3000',
        methods: ['GET', 'POST'],
      },
    });

    io.on('connection', (socket) => {
      console.log('New client connected:', socket.id);

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });

    return io;
  },

  getIO() {
    if (!io) {
      throw new Error('Socket.io not initialized!');
    }
    return io;
  },
};