# KeeBo API Documentation

Base URL: `http://localhost:5000/api`

## Authentication
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| POST | `/auth/register` | Public | Register a new user or technician. |
| POST | `/auth/login` | Public | Login and receive JWT token. |

## Technicians
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| GET | `/technicians` | Public | Get all approved technicians with filters. |
| POST | `/technicians/profile` | Technician | Create a technician profile. |
| PUT | `/technicians/profile` | Technician | Update technician profile. |
| GET | `/technicians/profile` | Technician | Get own profile. |
| GET | `/technicians/:id/reviews` | Public | Get reviews for a technician. |
| POST | `/technicians/:id/reviews` | User | Add or update a review. |

## Bookings
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| POST | `/bookings` | User | Create a new booking request. |
| GET | `/bookings` | Private | Get bookings (Technician sees assigned, User sees own). |
| PUT | `/bookings/:id/status` | Private | Accept, Reject, Complete, or Cancel a booking. |

## Notifications
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| GET | `/notifications` | Private | Get all notifications for the logged-in user. |
| PUT | `/notifications/:id/read` | Private | Mark a specific notification as read. |
| PUT | `/notifications/read-all` | Private | Mark all notifications as read. |

## Users
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| GET | `/users/profile` | Private | Get current user profile. |
| PUT | `/users/favorites/:techId` | Private | Add/Remove technician from favorites. |
