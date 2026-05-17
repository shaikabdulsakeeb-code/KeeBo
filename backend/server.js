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

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Users & Technicians join their personal room
    socket.on('join', (userId) => {
      if (userId) {
        socket.join(userId);
        console.log(`User ${userId} joined their personal room`);
      }
    });

    // Admins join a global admin room
    socket.on('joinAdmin', () => {
      socket.join('admin_room');
      console.log(`Socket ${socket.id} joined admin_room`);
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
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
