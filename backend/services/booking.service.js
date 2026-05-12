const Booking = require('../models/Booking');
const Notification = require('../models/Notification');
const Technician = require('../models/Technician');
const { sendNotification } = require('../socket/socketHandler');

/**
 * @desc    Create a new booking and notify the technician
 */
exports.createBooking = async (bookingData) => {
  const booking = await Booking.create(bookingData);

  // Find the technician's user ID to send notification
  const technician = await Technician.findById(booking.technician).populate('userId');
  
  if (technician && technician.userId) {
    const receiverId = technician.userId._id.toString();

    // Create notification in DB
    const notification = await Notification.create({
      receiver: receiverId,
      title: 'New Booking Request',
      message: `You have a new booking request for ${booking.service}`,
      type: 'booking',
      bookingId: booking._id,
    });

    // Send realtime notification via Socket.IO
    sendNotification(receiverId, 'NEW_BOOKING', {
      notification,
      booking,
    });
  }

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

  // Notify the user about status change
  const notification = await Notification.create({
    receiver: booking.user._id,
    title: 'Booking Status Updated',
    message: `Your booking for ${booking.service} has been ${status}`,
    type: 'booking',
    bookingId: booking._id,
  });

  sendNotification(booking.user._id.toString(), 'BOOKING_STATUS_CHANGED', {
    notification,
    booking,
  });

  return booking;
};
