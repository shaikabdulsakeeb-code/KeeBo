# KeeBo Backend 🚀

The high-performance, realtime backend for the KeeBo hyperlocal services marketplace.

## Features
- 🔐 **Secure Auth**: JWT-based authentication with role-based access control (User, Technician, Admin).
- 📅 **Booking System**: Complete state-managed booking lifecycle (Request -> Accept -> Complete).
- 🔔 **Realtime Notifications**: Instant updates via Socket.IO for new bookings and status changes.
- ⭐ **Advanced Review System**: Automated average rating recalculation and review management.
- 🖼️ **Media Handling**: Profile and work image uploads integrated with Cloudinary.
- 📡 **Search & Filter**: Find technicians by category, price, and rating.

## Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose)
- **Realtime**: Socket.IO
- **Storage**: Cloudinary
- **Security**: JWT, Bcrypt, Role Middleware

## Project Structure
```
backend/
├── config/       # Configuration (DB, Cloudinary)
├── controllers/  # Request handlers
├── middleware/   # Auth, roles, errors, uploads
├── models/       # Database schemas
├── routes/       # API endpoints
├── services/     # Business logic (Booking service)
├── socket/       # Realtime logic (Socket.IO)
├── utils/        # Helpers (Token, ErrorResponse)
├── scripts/      # Standalone scripts (Seeders)
├── validators/   # Input validation logic
├── app.js        # Express configuration
└── server.js     # Server entry point & Socket init
```

## Getting Started

### 1. Installation
```bash
cd backend
npm install
```

### 2. Environment Setup
Create a `.env` file in the `backend` folder:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=30d

CLOUDINARY_CLOUD_NAME=your_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret

ADMIN_EMAIL=admin@keebo.com
ADMIN_PASSWORD=admin123
```

### 3. Seed Admin
```bash
cd scripts
node seedAdmin.js
```

### 4. Run Server
```bash
npm run dev
```

## Documentation
- [API Documentation](API_DOCUMENTATION.md)
- [Booking Flow](BOOKING_FLOW.md)
- [Socket Flow](SOCKET_FLOW.md)
- [Architecture](ARCHITECTURE.md)
