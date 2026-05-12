const socketIO = require('socket.io');

let io;
const userSocketMap = new Map();

const initSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: '*', // Adjust for production
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId;
    
    if (userId && userId !== 'undefined') {
      userSocketMap.set(userId, socket.id);
      socket.join(userId);
      console.log(`User connected: ${userId} with socket ID: ${socket.id}`);
    }

    socket.on('disconnect', () => {
      if (userId) {
        userSocketMap.delete(userId);
        console.log(`User disconnected: ${userId}`);
      }
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

const sendNotification = (receiverId, event, data) => {
  if (io) {
    io.to(receiverId).emit(event, data);
  }
};

module.exports = { initSocket, getIO, sendNotification, userSocketMap };
