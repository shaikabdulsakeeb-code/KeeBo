# Hyperlocal Marketplace Backend

A production-ready Node.js backend system for a hyperlocal service marketplace (similar to Urban Company). It provides core functionalities for users to find service professionals (technicians) and for technicians to manage their profiles, along with admin management tools.

## 🚀 Features

- **Authentication System**: Secure JWT-based registration and login.
- **Role-Based Access Control**: Different access levels for `user`, `technician`, and `admin`.
- **Technician Profiles**: Technicians can create and update profiles with categories, pricing, experience, and service areas.
- **File Uploads**: Integration with Cloudinary for uploading profile and work images using Multer.
- **Advanced Querying**: Filter, sort, paginate, and search capabilities using reusable `APIFeatures` utility.
- **Review System**: Users can leave reviews for technicians. The system automatically recalculates the average rating and total reviews for the technician.
- **Admin Management**: Admins can approve/reject technicians and manage users.
- **Security**: Includes `express-rate-limit` to prevent brute-force attacks and robust error handling.

## 🛠 Tech Stack

- **Node.js** & **Express.js** (Server framework)
- **MongoDB** & **Mongoose** (Database)
- **JWT** & **bcryptjs** (Authentication & Security)
- **Multer** & **Cloudinary** (File Uploads)
- **Morgan** (Logging)

## 📁 Folder Structure

```
backend/
├── config/
│   ├── db.js                # MongoDB connection
│   └── cloudinary.js        # Cloudinary config
├── controllers/
│   ├── admin.controller.js  # Admin logic
│   ├── auth.controller.js   # Auth logic
│   ├── technician.controller.js # Technician logic
│   └── user.controller.js   # User/Review logic
├── middleware/
│   ├── auth.middleware.js   # JWT protection
│   ├── error.middleware.js  # Global error handler
│   ├── role.middleware.js   # Role authorization
│   └── upload.middleware.js # Multer configuration
├── models/
│   ├── Review.js            # Review schema
│   ├── Technician.js        # Technician schema
│   └── User.js              # User schema
├── routes/
│   ├── admin.routes.js      # Admin routes
│   ├── auth.routes.js       # Auth routes
│   ├── technician.routes.js # Technician routes
│   └── user.routes.js       # User routes
├── utils/
│   ├── apiFeatures.js       # Advanced query builder
│   └── generateToken.js     # JWT generator
├── app.js                   # Express App setup
├── server.js                # Server entry point
└── .env.example             # Example Env variables
```

## ⚙️ Setup Instructions

1. Clone the repository and navigate into the `backend` folder.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy the `.env.example` file to `.env` and fill in the details:
   ```bash
   cp .env.example .env
   ```
4. Start the server (development mode):
   ```bash
   npm start # if using nodemon, or simply `node server.js`
   ```

## 🔐 Environment Variables

Create a `.env` file in the root with the following:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=30d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## 📚 API Documentation

### Auth Endpoints

| Method | Endpoint | Description | Access |
| ------ | -------- | ----------- | ------ |
| `POST` | `/api/auth/register` | Register a new user/technician | Public |
| `POST` | `/api/auth/login` | Login and get JWT | Public |

### Technician Endpoints

| Method | Endpoint | Description | Access |
| ------ | -------- | ----------- | ------ |
| `GET` | `/api/technicians` | Get all approved technicians (supports query params: `?category=plumber&sort=-rating&page=1`) | Public |
| `GET` | `/api/technicians/profile` | Get logged-in technician's profile | Private (Technician) |
| `POST` | `/api/technicians/profile` | Create technician profile (supports `multipart/form-data`) | Private (Technician) |
| `PUT` | `/api/technicians/profile` | Update technician profile (supports `multipart/form-data`) | Private (Technician) |

### User/Review Endpoints

| Method | Endpoint | Description | Access |
| ------ | -------- | ----------- | ------ |
| `GET` | `/api/users/reviews/:technicianId` | Get all reviews for a technician | Public |
| `POST` | `/api/users/reviews/:technicianId` | Add a review for a technician | Private (User) |

### Admin Endpoints

| Method | Endpoint | Description | Access |
| ------ | -------- | ----------- | ------ |
| `GET` | `/api/admin/users` | Get all users | Private (Admin) |
| `DELETE` | `/api/admin/users/:id` | Delete a user & their profile | Private (Admin) |
| `GET` | `/api/admin/technicians` | Get all technicians (including pending) | Private (Admin) |
| `PUT` | `/api/admin/technicians/:id/status` | Update technician status (`approved`/`rejected`) | Private (Admin) |

## 🧪 Example Requests (Postman)

### 1. Register User

**POST** `/api/auth/register`

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "technician"
}
```

### 2. Create Technician Profile

**POST** `/api/technicians/profile`
*(Content-Type: multipart/form-data)*

- `category`: plumber
- `experience`: 5
- `pricing`: 50
- `serviceAreas`: "Downtown, Uptown"
- `profileImage`: (File Upload)
- `workImages`: (Multiple File Uploads)

### 3. Add a Review

**POST** `/api/users/reviews/<technician_id>`

```json
{
  "rating": 5,
  "comment": "Great service, arrived on time!"
}
```

### 4. Advanced Search/Filter

**GET** `/api/technicians?category=plumber&sort=-pricing&limit=5&page=1`
