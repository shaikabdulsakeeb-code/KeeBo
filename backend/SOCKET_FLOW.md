# Realtime Socket.IO Flow

KeeBo uses Socket.IO for instant communication between users and technicians.

## 1. Connection Logic
- **Trigger**: User logs into the web app.
- **Client Action**: Connects to `http://localhost:5000` with `userId` in handshake query.
- **Server Action**: 
  - Validates `userId`.
  - Maps `userId` to `socket.id` in a server-side `Map`.
  - Joins a private room named `userId`.

## 2. Booking Notification Flow
1. **User** submits a booking request via POST `/api/bookings`.
2. **Backend** processes the booking and identifies the **Technician's** `userId`.
3. **Backend** creates a `Notification` record in MongoDB.
4. **Backend** checks if the Technician is online (has an active socket).
5. **Backend** emits a `NEW_BOOKING` event to the Technician's room.
6. **Client (Technician)** receives the event and displays a popup/toast.

## 3. Status Update Flow
1. **Technician** accepts/rejects the booking via PUT `/api/bookings/:id/status`.
2. **Backend** updates the booking status.
3. **Backend** creates a `Notification` for the **User**.
4. **Backend** emits a `BOOKING_STATUS_CHANGED` event to the User's room.
5. **Client (User)** receives the event and updates the UI.

## Events List
| Event Name | Direction | Payload |
| :--- | :--- | :--- |
| `NEW_BOOKING` | Server -> Tech | `{ notification, booking }` |
| `BOOKING_STATUS_CHANGED` | Server -> User | `{ notification, booking }` |
| `NEW_REVIEW` | Server -> Tech | `{ notification, review }` |
