# KeeBo Backend: Line-by-Line Code Deep Dive

This document provides a granular, line-by-line explanation of the core files in the KeeBo backend to help you understand exactly why every line was written.

---

## 1. Entry Point: `server.js`
This file is the "Engine Starter" for the entire application.

```javascript
const dotenv = require('dotenv'); // Loads environment variables from .env file
const connectDB = require('./config/db'); // Imports the database connection logic

// 1. Load env vars
dotenv.config({ override: true }); // Makes variables in .env (like PORT, DB_URI) available to the app

// 2. Main Startup Function
const startServer = async () => {
  await connectDB(); // Waits for MongoDB to connect before starting the server
  
  // 3. Seed Admin
  const seedAdmin = require('./utils/seedAdmin'); 
  await seedAdmin(); // Automatically creates an admin user if none exists (convenience for development)
  
  // 4. Import App
  const app = require('./app'); // Imports the Express configuration (separated for testing)

  const PORT = process.env.PORT || 5000; // Defines which port to listen on
  const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`); // Logs success to the terminal
  });

  // 5. Safety Catch
  process.on('unhandledRejection', (err, promise) => {
    console.error(`Error: ${err.message}`);
    server.close(() => process.exit(1)); // Gracefully shuts down if a database connection or async task fails
  });
};

startServer();
```

---

## 2. Express Config: `app.js`
This is where the "Middleware Pipeline" is built.

```javascript
const express = require('express'); // The core web framework
const cors = require('cors'); // Allows the frontend (React/Vue) to talk to this API from a different URL
const morgan = require('morgan'); // Logs every incoming request to the console for debugging
const { errorHandler, notFound } = require('./middleware/error.middleware'); // Custom error handlers

const app = express();

// Global Middlewares
app.use(express.json()); // Essential: Allows the app to read JSON data sent in the request body
app.use(cors()); // Essential: Prevents browser "CORS errors" when the frontend tries to call the API

// Routes
app.use('/api/auth', authRoutes); // All routes starting with /api/auth go to authRoutes
app.use('/api/technicians', technicianRoutes); // All technician logic handled here
// ... and so on

// Error Handling (Must be at the bottom)
app.use(notFound); // If no route matches, this creates a 404 error
app.use(errorHandler); // This catches any error thrown in the app and sends a clean JSON response
```

---

## 3. Data Model: `models/User.js`
Defines what a "User" looks like in the database.

```javascript
const userSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Ensures every user has a name
  email: { type: String, unique: true }, // "unique" ensures no two people sign up with the same email
  password: { 
    type: String, 
    select: false // Crucial: Prevents the password from being sent in API responses by default
  },
  role: { 
    type: String, 
    enum: ['user', 'technician', 'admin'], // Restricts roles to only these three values
    default: 'user' 
  }
});

// Password Hashing (Security)
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) next(); // Only hash if the password is new or changed
  const salt = await bcrypt.genSalt(10); // Generates a random "salt" for extra security
  this.password = await bcrypt.hash(this.password, salt); // Turns "password123" into "$2a$10$..."
});
```

---

## 4. Auth Controller: `controllers/auth.controller.js`
The logic for Login and Register.

```javascript
const register = async (req, res, next) => {
  const { name, email, password, role } = req.body; // Extract data from the request body

  // Security Check
  if (role === 'admin') {
    return next(new Error('Cannot register as an admin')); // Prevents malicious users from granting themselves admin rights
  }

  const user = await User.create({ name, email, password, role }); // Saves the user to MongoDB
  
  res.status(201).json({
    success: true,
    token: generateToken(user._id) // Immediately signs a JWT so the user is "logged in" after registration
  });
};
```

---

## 5. Auth Middleware: `middleware/auth.middleware.js`
The "Gatekeeper" for protected routes.

```javascript
const protect = async (req, res, next) => {
  let token;
  // 1. Check for token in headers
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1]; // Extracts the actual token string
    
    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Checks if the token is valid and not expired
    
    // 3. Attach user to request
    req.user = await User.findById(decoded.id).select('-password'); // Finds the user and adds them to 'req', so controllers know WHO is making the request
    next(); // Move to the next function (the controller)
  }
  // ... else return Unauthorized error
};
```

---

## 6. API Features: `utils/apiFeatures.js`
Why this file exists: To make searching, filtering, and paging easy.

```javascript
class APIFeatures {
  constructor(query, queryString) {
    this.query = query; // The Mongoose query (e.g., Technician.find())
    this.queryString = queryString; // The URL params (e.g., ?category=plumbing)
  }

  filter() {
    const queryObj = { ...this.queryString }; // Copy the params
    const excludedFields = ['page', 'sort', 'limit', 'fields']; // Remove special params that aren't filters
    excludedFields.forEach(el => delete queryObj[el]);

    this.query = this.query.find(queryObj); // Applies the remaining filters to the DB query
    return this; // Allows "method chaining" (e.g., .filter().sort())
  }
}
```

---

*This walkthrough covers the primary logic blocks. Every line is written to balance **Security**, **Scalability**, and **Developer Experience**.*

---

## 7. Database Config: `config/db.js`
```javascript
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Attempt to connect using the URI from your .env file
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1); // If connection fails, stop the app immediately
  }
};
```

---

## 8. File Upload logic: `middleware/upload.middleware.js`
Uses **Multer** to handle images before they go to Cloudinary.

```javascript
const multer = require('multer');

// Store files in memory temporarily instead of on the hard drive
const storage = multer.memoryStorage();

// Filter: Only allow Image files
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true); // Accept
  } else {
    cb(new Error('Not an image! Please upload only images.'), false); // Reject
  }
};

const upload = multer({ storage, fileFilter });
module.exports = upload;
```

---

## 9. Cloudinary Config: `config/cloudinary.js`
```javascript
const cloudinary = require('cloudinary').v2;

// These credentials come from your Cloudinary dashboard via .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports = cloudinary;
```

---

## 10. Technician Model: `models/Technician.js`
Extends the User model with specific professional data.

```javascript
const technicianSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', // Links this profile to a specific record in the Users collection
    required: true 
  },
  isApproved: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending' // Security: Every new tech starts as 'pending' until verified by an Admin
  },
  // ... categories, experience, pricing
});
```

---

## 11. Review Model: `models/Review.js`
Handles the rating system.

```javascript
const reviewSchema = new mongoose.Schema({
  rating: { type: Number, min: 1, max: 5 }, // Enforces a 1-5 star scale
  technician: { type: mongoose.Schema.Types.ObjectId, ref: 'Technician' }, // Who is being reviewed
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // Who wrote the review
});

// Static method to calculate average rating
reviewSchema.statics.getAverageRating = async function(techId) {
  const stats = await this.aggregate([
    { $match: { technician: techId } },
    { $group: { _id: '$technician', avgRating: { $avg: '$rating' } } }
  ]);
  // This updates the Technician's main profile with the new average automatically
};
```

---

## 12. Admin Controller: `controllers/admin.controller.js`
The "Dashboard Logic" for platform owners.

```javascript
const approveTechnician = async (req, res, next) => {
  const { id } = req.params; // Get the technician ID from the URL
  const { status } = req.body; // 'approved' or 'rejected'

  const technician = await Technician.findByIdAndUpdate(id, { isApproved: status });
  // This is the core function that allows the platform to verify workers.
};
```

---

## 13. Role Middleware: `middleware/role.middleware.js`
```javascript
const authorize = (...roles) => {
  return (req, res, next) => {
    // req.user was added earlier by the 'protect' middleware
    if (!roles.includes(req.user.role)) {
      return next(new Error('Forbidden: You do not have permission')); // Stops users from hitting admin/tech routes
    }
    next();
  };
};
```

---

## 14. Utilities

### `utils/generateToken.js`
```javascript
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  // Creates a token that lasts for 30 days
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};
```

### `utils/seedAdmin.js`
```javascript
const User = require('../models/User');

const seedAdmin = async () => {
  const adminExists = await User.findOne({ role: 'admin' });
  if (!adminExists) {
    // Automatically creates an admin if the DB is empty (useful for first-time setup)
    await User.create({ name: 'Admin', email: 'admin@keebo.com', password: 'adminpassword', role: 'admin' });
  }
};
```
