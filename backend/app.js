const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { errorHandler, notFound } = require('./middleware/error.middleware');

// Route imports
const authRoutes = require('./routes/auth.routes');
const technicianRoutes = require('./routes/technician.routes');
const userRoutes = require('./routes/user.routes');
const adminRoutes = require('./routes/admin.routes');
const bookingRoutes = require('./routes/booking.routes');
const notificationRoutes = require('./routes/notification.routes');
const reviewRoutes = require('./routes/review.routes');

const app = express();

// Global Middlewares
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(cors()); // Enable CORS

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); // Logging in development
}

// Rate Limiting to prevent brute-force attacks
app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000, // Increased for testing
  message: 'Too many requests',
}));

// Base route for testing
app.get('/', (req, res) => {
  res.send('API is running...');
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/technicians', technicianRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/notifications', notificationRoutes);
// app.use('/api/reviews', reviewRoutes);

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

module.exports = app;
