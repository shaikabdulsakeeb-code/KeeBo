# KeeBo Backend: File Manifest & Purpose

This document explains the role and purpose of every directory and key file within the KeeBo backend architecture.

---

## 📂 Root Directory
*   **`server.js`**: The main entry point. It initializes the database connection, creates the HTTP server, starts Socket.IO, and listens on the configured port.
*   **`app.js`**: Configures the Express application, applies global middlewares (CORS, JSON parsing, logging), and defines the base API route mappings.
*   **`.env`**: Stores sensitive environment variables like Database URIs, JWT secrets, and Cloudinary credentials.
*   **`package.json`**: Defines project dependencies, metadata, and execution scripts (`npm start`, `npm run dev`).

---

## 📂 `config/` (Configuration)
*   **`db.js`**: Contains the Mongoose connection logic to connect the app to MongoDB.
*   **`cloudinary.js`**: Configures the Cloudinary SDK for image uploads.

---

## 📂 `controllers/` (Business Logic)
*   **`auth.controller.js`**: Handles user registration and login logic.
*   **`technician.controller.js`**: Manages technician profiles, category updates, and provider discovery.
*   **`booking.controller.js`**: The "brain" for the marketplace; handles booking creation, status updates (Accept/Reject/Complete).
*   **`notification.controller.js`**: Manages fetching and marking notifications as read.
*   **`user.controller.js`**: Handles user-specific actions like profile retrieval and writing reviews.

---

## 📂 `middleware/` (Interceptors)
*   **`auth.middleware.js`**: Protects routes by verifying JWT tokens and attaching the user to the request.
*   **`role.middleware.js`**: Restricts access based on user roles (e.g., `admin` only, `technician` only).
*   **`error.middleware.js`**: Standardizes error responses across the entire API.
*   **`async.middleware.js`**: A wrapper to handle async/await try-catch blocks cleanly.
*   **`upload.middleware.js`**: Handles multipart/form-data using Multer for image uploads.

---

## 📂 `models/` (Data Schemas)
*   **`User.js`**: Schema for all users (Customers, Technicians, Admins). Handles password hashing.
*   **`Technician.js`**: Stores professional details (category, experience, bio) linked to a User.
*   **`Booking.js`**: Tracks service requests, scheduled dates, and status between users and technicians.
*   **`Notification.js`**: Stores alerts for bookings, reviews, and system messages.
*   **`Review.js`**: Stores ratings and comments left by customers for technicians.

---

## 📂 `routes/` (URL Mapping)
*   **`auth.routes.js`**: Endpoints for `/api/auth`.
*   **`technician.routes.js`**: Endpoints for `/api/technicians`.
*   **`booking.routes.js`**: Endpoints for `/api/bookings`.
*   **`user.routes.js`**: Endpoints for `/api/users`.
*   **`notification.routes.js`**: Endpoints for `/api/notifications`.

---

## 📂 `socket/` (Real-time)
*   **`socketHandler.js`**: Manages Socket.IO connections, room joins (by User ID), and real-time event emitting.

---

## 📂 `utils/` (Helper Functions)
*   **`apiFeatures.js`**: A reusable class for filtering, sorting, and pagination of MongoDB queries.
*   **`generateToken.js`**: Logic for creating JWT tokens.
*   **`errorResponse.js`**: A custom Error class for standardized API error handling.

---

## 📂 `validators/` (Input Security)
*   **`auth.validator.js`**: Ensures that registration and login data meet security and format requirements before reaching the controller.

---

## 📂 `scripts/` (Utility Scripts)
*   **`seedAdmin.js`**: A one-time script to create the initial system administrator.
*   **`test_api_flow.js`**: An automated script to verify that the backend is working correctly.

---

## 📂 Documentation Files
*   **`BACKEND_ARCHITECTURE.md`**: High-level design overview.
*   **`API_DOCUMENTATION.md`**: Detailed list of all available endpoints.
*   **`SOCKET_FLOW.md`**: Explains how real-time notifications work.
*   **`FILE_MANIFEST.md`**: This file! (The "Map" of the project).
