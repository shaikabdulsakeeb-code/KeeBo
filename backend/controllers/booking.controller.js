const bookingService = require('../services/booking.service');
const Booking = require('../models/Booking');
const asyncHandler = require('../middleware/async.middleware'); // Assuming this exists or I'll create it
const ErrorResponse = require('../utils/errorResponse');

// @desc    Create a booking
// @route   POST /api/bookings
// @access  Private/User
exports.createBooking = asyncHandler(async (req, res, next) => {
  req.body.user = req.user.id;
  
  const booking = await bookingService.createBooking(req.body);

  res.status(201).json({
    success: true,
    data: booking,
  });
});

// @desc    Get all bookings for logged in user (User or Technician)
// @route   GET /api/bookings
// @access  Private
exports.getBookings = asyncHandler(async (req, res, next) => {
  let query;

  if (req.user.role === 'technician') {
    // Need to find the technician record first
    const Technician = require('../models/Technician');
    const technician = await Technician.findOne({ userId: req.user.id });
    if (!technician) {
      return next(new ErrorResponse('Technician profile not found', 404));
    }
    query = Booking.find({ technician: technician._id }).populate('user', 'name email');
  } else {
    query = Booking.find({ user: req.user.id }).populate('technician');
  }

  const bookings = await query.sort('-createdAt');

  res.status(200).json({
    success: true,
    count: bookings.length,
    data: bookings,
  });
});

// @desc    Update booking status (Accept/Reject/Complete)
// @route   PUT /api/bookings/:id/status
// @access  Private
exports.updateStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;
  const bookingId = req.params.id;

  // Validation
  const allowedStatuses = ['accepted', 'rejected', 'completed', 'cancelled'];
  if (!allowedStatuses.includes(status)) {
    return next(new ErrorResponse('Invalid status', 400));
  }

  const booking = await bookingService.updateBookingStatus(bookingId, status, req.user.id);

  res.status(200).json({
    success: true,
    data: booking,
  });
});
