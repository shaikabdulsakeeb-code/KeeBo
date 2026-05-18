const http = require('http');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const seedAdmin = require('./scripts/seedAdmin');
// Load env vars
dotenv.config({ override: true });

// Connect to database
const startServer = async () => {
  await connectDB();
  await seedAdmin();
  
  // Import the configured express app
  const app = require('./app');

  // Create HTTP server
  const server = http.createServer(app);
  
  // Set up Socket.io
  const { Server } = require('socket.io');
  const io = new Server(server, {
    cors: {
      origin: '*', // You can restrict this in production
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
    }
  });

  // Make 'io' accessible in routes/controllers
  app.set('io', io);

  const getOnlineCounts = () => {
    const uniqueUsers = new Set();
    const uniqueTechnicians = new Set();

    const sockets = io.of("/").sockets;
    for (const [id, s] of sockets) {
      if (s.userRole === 'admin') {
        continue;
      }

      if (s.userRole === 'technician') {
        uniqueTechnicians.add(s.userId || id);
      } else {
        uniqueUsers.add(s.userId || id);
      }
    }

    return {
      users: uniqueUsers.size,
      technicians: uniqueTechnicians.size
    };
  };

  const broadcastOnlineStats = () => {
    io.to('admin_room').emit('onlineStats', getOnlineCounts());
  };

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Users & Technicians join their personal room
    socket.on('join', (data) => {
      let userId;
      let role = 'user';

      if (data && typeof data === 'object') {
        userId = data.userId;
        role = data.role || 'user';
      } else {
        userId = data;
      }

      if (userId) {
        socket.join(userId);
        socket.userId = userId;
        socket.userRole = role;
        console.log(`User ${userId} (${role}) joined their personal room`);
        broadcastOnlineStats();
      }
    });

    // Admins join a global admin room
    socket.on('joinAdmin', () => {
      socket.join('admin_room');
      socket.userId = 'admin';
      socket.userRole = 'admin';
      console.log(`Socket ${socket.id} joined admin_room`);
      socket.emit('onlineStats', getOnlineCounts());
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
      broadcastOnlineStats();
    });
  });

  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err, promise) => {
    console.error(`Error: ${err.message}`);
    // Close server & exit process
    server.close(() => process.exit(1));
  });
};

startServer();
// Touch for nodemon reload - clean boot after hardening and updates
