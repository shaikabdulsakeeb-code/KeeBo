const Booking = require('../models/Booking');
const Technician = require('../models/Technician');

/**
 * @desc    Create a new booking and notify the technician
 */
exports.createBooking = async (bookingData) => {
  const booking = await Booking.create(bookingData);

  // Find the technician's user ID to send notification
  const technician = await Technician.findById(booking.technician).populate('userId');



  return booking;
};

/**
 * @desc    Update booking status and notify the user
 */
exports.updateBookingStatus = async (bookingId, status, userId) => {
  const booking = await Booking.findById(bookingId).populate('user');

  if (!booking) {
    throw new Error('Booking not found');
  }

  booking.status = status;
  await booking.save();



  return booking;
};
