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

  const populatedBooking = await Booking.findById(booking._id)
    .populate('user', 'name email profileImage')
    .populate({
      path: 'technician',
      populate: { path: 'userId', select: 'name email profileImage' }
    });

  // Emit Real-Time Events
  const io = req.app.get('io');
  if (io && populatedBooking) {
    const Technician = require('../models/Technician');
    const tech = await Technician.findById(booking.technician);
    if (tech) {
      // Notify technician
      io.to(tech.userId.toString()).emit('newBooking', populatedBooking.toJSON());
    }
    // Notify admins
    io.to('admin_room').emit('bookingCreated', populatedBooking.toJSON());
  }

  res.status(201).json({
    success: true,
    data: populatedBooking,
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
    query = Booking.find({ user: req.user.id }).populate({
      path: 'technician',
      populate: { path: 'userId', select: 'name email profileImage' }
    });
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

  const allowedStatuses = ['accepted', 'rejected', 'completed', 'cancelled'];
  if (!allowedStatuses.includes(status)) {
    return next(new ErrorResponse('Invalid status', 400));
  }

  const booking = await Booking.findById(bookingId);
  if (!booking) {
    return next(new ErrorResponse('Booking not found', 404));
  }

  booking.status = status;
  if (status === 'cancelled') {
    booking.cancelledBy = req.user.role === 'admin' ? 'admin' : (req.user.role === 'technician' ? 'technician' : 'user');
    booking.cancelledAt = new Date();
  }

  await booking.save();

  // If status is completed, increment jobs done
  if (status === 'completed') {
     const Technician = require('../models/Technician');
     await Technician.findByIdAndUpdate(booking.technician, { $inc: { jobsDone: 1 } });
  }

  const populatedBooking = await Booking.findById(bookingId)
    .populate('user', 'name email profileImage')
    .populate({
      path: 'technician',
      populate: { path: 'userId', select: 'name email profileImage' }
    });

  // Emit Real-Time Events
  const io = req.app.get('io');
  if (io && populatedBooking) {
    // Notify the user who made the booking
    io.to(booking.user.toString()).emit('bookingUpdated', populatedBooking.toJSON());
    
    // Notify the technician
    const Technician = require('../models/Technician');
    const tech = await Technician.findById(booking.technician);
    if (tech) {
      io.to(tech.userId.toString()).emit('bookingUpdated', populatedBooking.toJSON());
    }
    
    // Notify admins
    io.to('admin_room').emit('bookingUpdated', populatedBooking.toJSON());
  }

  res.status(200).json({
    success: true,
    data: populatedBooking,
  });
});
