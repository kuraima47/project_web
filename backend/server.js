// File: backend/server.js
const app = require('./src/app');
const http = require('http');
const socketIo = require('socket.io');
const socketService = require('./src/services/socketService');
require('dotenv').config();

const server = http.createServer(app);
const io = socketIo(server);

socketService.init(io);

const PORT = process.env.PORT_TW || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});