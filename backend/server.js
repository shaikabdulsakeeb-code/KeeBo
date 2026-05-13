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
