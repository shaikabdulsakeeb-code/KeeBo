# KeeBo Backend Documentation: Architecture & Logic

This document provides a comprehensive technical overview of the KeeBo backend, explaining the "how" and "why" behind the code structure, logic, and architectural decisions.

---

## 1. Architectural Overview

The KeeBo backend is built using a **Clean MVC (Model-View-Controller)** architecture pattern, designed for scalability, maintainability, and security.

### Core Stack:
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (with Mongoose ODM)
- **Authentication**: JSON Web Tokens (JWT) & BcryptJS
- **File Storage**: Cloudinary (for profile and work images)

### Design Philosophy:
1. **Separation of Concerns**: Logic is divided into distinct layers (Routes -> Controllers -> Models).
2. **RESTful Principles**: API endpoints follow standard HTTP methods (GET, POST, PUT, DELETE) and naming conventions.
3. **Statelessness**: The server doesn't store session data; it uses JWT for authentication, making it easier to scale.
4. **Centralized Error Handling**: A unified middleware manages all errors, ensuring consistent API responses.

---

## 2. Directory Structure Explained

| Directory | Purpose | Why? |
| :--- | :--- | :--- |
| `config/` | Database & Cloudinary configurations. | Keeps environment-specific settings isolated from business logic. |
| `controllers/` | Request handlers and business logic. | The "brain" of the app. It processes inputs, interacts with models, and returns responses. |
| `middleware/` | Custom functions that run during the request-response cycle. | Handles cross-cutting concerns like Authentication, Authorization, and Error Handling. |
| `models/` | Data schemas and database interaction logic. | Defines the "shape" of data and enforces validation rules at the DB level. |
| `routes/` | Endpoint definitions and mapping to controllers. | Acts as a traffic controller, directing requests to the right logic. |
| `utils/` | Reusable helper functions (Token generation, API filtering). | Prevents code duplication (DRY principle). |

---

## 3. Core Logic & Functionality

### A. Authentication & Security (`controllers/auth.controller.js`)
**How it works:**
- **Registration**: Validates input, checks if the user exists, and hashes the password before saving. It prevents anyone from manually registering as an `admin`.
- **Login**: Compares the provided password with the hashed password in the DB using Bcrypt. If valid, it returns a JWT.
- **JWT**: Used to maintain a "logged-in" state without sessions. The token contains the User ID and is signed with a secret key.

**Why?**
Hashing passwords ensures that even if the database is breached, user passwords remain secure. JWTs allow for a stateless backend that can easily scale horizontally.

### B. Technician Management (`controllers/technician.controller.js`)
**How it works:**
- **Profile Creation**: Technicians must create a profile to be listed. This includes category, experience, and images.
- **Approval System**: By default, `isApproved` is set to `pending`. Only admins can change this to `approved`.
- **Filtering**: The `getApprovedTechnicians` function uses `isApproved: 'approved'` to ensure customers only see verified service providers.

**Why?**
The approval logic is a safety measure. Since this is a service marketplace, verifying technicians prevents fraud and ensures quality control.

### C. Advanced Querying (`utils/apiFeatures.js`)
**How it works:**
A reusable class that handles:
1. **Filtering**: `?category=plumber`
2. **Sorting**: `?sort=-price`
3. **Field Limiting**: `?fields=name,price`
4. **Pagination**: `?page=2&limit=10`

**Why?**
Instead of writing complex Mongoose queries in every controller, `APIFeatures` provides a "standard way" to handle data manipulation for any model.

### D. Middleware Layer
- **`auth.middleware.js`**: Intercepts requests, extracts the JWT from the `Authorization` header, verifies it, and attaches the user object to `req.user`.
- **`role.middleware.js`**: A higher-order function that checks if `req.user.role` matches the required roles for a specific route.
- **`error.middleware.js`**: Catches any errors thrown in controllers (using `next(error)`) and formats them into a clean JSON response.

---

## 4. Standard Workflows

### The Life of a Request:
1. **Entry**: Request hits `server.js` -> `app.js`.
2. **Routing**: `app.js` directs the request to a specific route file (e.g., `routes/user.routes.js`).
3. **Middleware**: If protected, `protect` and `authorize` middlewares run first.
4. **Controller**: The controller function is executed.
5. **Model Interaction**: The controller asks the Model for data or to save data.
6. **Response**: The controller sends a JSON response back to the client.

### Image Upload Workflow:
1. Client sends multipart/form-data.
2. `upload.middleware.js` (Multer) processes the file into a buffer.
3. Controller sends the buffer to `cloudinary.js`.
4. Cloudinary returns a URL.
5. Controller saves the URL in the MongoDB document.

---

## 5. Summary of Design Patterns Used

- **Singleton Pattern**: Used for the Database connection (`config/db.js`) to ensure only one connection pool exists.
- **Factory Pattern (Functional)**: Middleware like `authorize(...roles)` acts as a factory that generates specific middleware functions based on arguments.
- **Observer Pattern (Mongoose Hooks)**: `userSchema.pre('save')` observes the "save" event to automatically hash passwords.

---
*Documentation generated to provide clarity on the KeeBo Backend Architecture.*
