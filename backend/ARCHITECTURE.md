# KeeBo Backend Architecture

A production-grade, scalable architecture for a hyperlocal services marketplace.

## Design Patterns
- **MVC (Model-View-Controller)**: Separation of data models, business logic (Controllers/Services), and presentation (API responses).
- **Service Layer**: Complex logic (like the Booking + Notification + Socket flow) is extracted into Services to keep Controllers lean and testable.
- **Middleware Chain**: Requests pass through a series of security, validation, and processing middlewares.
- **Centralized Error Handling**: A unified error middleware catches all exceptions and formats them consistently using the `ErrorResponse` utility.

## Layer Breakdown

### 1. Model Layer (`/models`)
- Uses Mongoose to define schemas and enforce data integrity.
- Implements hooks (like `pre-save` for hashing) and aggregation (for rating recalculation).

### 2. Service Layer (`/services`)
- The core business logic.
- Orchestrates multi-step processes like booking creation and realtime notification triggers.

### 3. Controller Layer (`/controllers`)
- Parses request data, calls appropriate services, and sends responses.
- Wrapped in `asyncHandler` to avoid repetitive try-catch blocks.

### 4. Socket Layer (`/socket`)
- Manages realtime bidirectional communication.
- Handles user connection mapping and event broadcasting.

### 5. Middleware Layer (`/middleware`)
- **Auth**: JWT verification and user hydration.
- **Role**: Access control for Users, Technicians, and Admins.
- **Upload**: File processing via Multer and Cloudinary.
- **Validation**: Input sanitization and rule checking.

## Security
- **JWT**: Stateless authentication with expiration.
- **Bcrypt**: Salted password hashing (10 rounds).
- **Role-Based Access Control (RBAC)**: Strict route protection based on user roles.
- **Public Admin Prevention**: Admins can only be created via backend seed scripts.
