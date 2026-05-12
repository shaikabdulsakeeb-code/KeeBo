# Booking Lifecycle Flow

The booking system follows a strict state-machine pattern to ensure data integrity and clear communication.

## Statuses
- `pending`: Initial state when a user requests a service.
- `accepted`: Technician has agreed to perform the service.
- `rejected`: Technician has declined the service.
- `completed`: Service has been successfully delivered.
- `cancelled`: Either user or technician has aborted the booking.

## The Process

### Step 1: Request
- **Actor**: User
- **Action**: `POST /api/bookings`
- **Result**: Booking created with `status: pending`. Technician notified in realtime.

### Step 2: Response
- **Actor**: Technician
- **Action**: `PUT /api/bookings/:id/status` (status: `accepted` or `rejected`)
- **Result**: Status updated. User notified in realtime.

### Step 3: Fulfillment
- **Actor**: Technician
- **Action**: `PUT /api/bookings/:id/status` (status: `completed`)
- **Result**: Service finalized. User prompted to leave a review.

### Step 4: Review (Optional)
- **Actor**: User
- **Action**: `POST /api/technicians/:id/reviews`
- **Result**: Review saved. Technician's average rating recalculated.
