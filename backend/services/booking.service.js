const Booking = require('../models/Booking');
const Technician = require('../models/Technician');
const SystemSettings = require('../models/SystemSettings');

/**
 * @desc    Helper to combine Date object/string and time string into a unified Date object
 */
const combineDateTime = (dateVal, timeStr) => {
  if (!dateVal || !timeStr) return new Date(0);
  const d = new Date(dateVal);
  const year = d.getFullYear();
  const month = d.getMonth();
  const date = d.getDate();
  
  const cleanTime = timeStr.trim();
  const match = cleanTime.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return new Date(year, month, date, 0, 0);
  
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  
  const isPM = cleanTime.toLowerCase().includes('pm');
  const isAM = cleanTime.toLowerCase().includes('am');
  if (isPM && hours < 12) hours += 12;
  if (isAM && hours === 12) hours = 0;
  
  return new Date(year, month, date, hours, minutes);
};

/**
 * @desc    Create a new booking and notify the technician
 */
exports.createBooking = async (bookingData) => {
  // Fetch global settings
  let settings = await SystemSettings.findOne();
  if (!settings) {
    settings = await SystemSettings.create({});
  }

  const technician = await Technician.findById(bookingData.technician).populate('userId');
  if (!technician) {
    throw new Error('Technician not found');
  }

  if (technician.isSuspended) {
    throw new Error('This professional is currently suspended and cannot receive new bookings.');
  }

  if (technician.isApproved !== 'approved') {
    throw new Error('This professional is not currently approved and cannot receive new bookings.');
  }

  // 2. Enforce Max Active Bookings per Technician
  const activeBookingsCount = await Booking.countDocuments({
    technician: bookingData.technician,
    status: { $in: ['pending', 'accepted'] }
  });

  if (activeBookingsCount >= settings.maxActiveBookingsPerTech) {
    throw new Error(`This technician has reached their maximum capacity of active bookings (${settings.maxActiveBookingsPerTech}). Please try booking later or choose another provider.`);
  }

  // Validate working days
  const bookingDate = new Date(bookingData.scheduledDate);
  const dayNamesShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayNamesFull = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const selectedDayShort = dayNamesShort[bookingDate.getDay()];
  const selectedDayFull = dayNamesFull[bookingDate.getDay()];

  if (Array.isArray(technician.workingDays) && technician.workingDays.length > 0) {
    if (!technician.workingDays.includes(selectedDayShort) && !technician.workingDays.includes(selectedDayFull)) {
      throw new Error(`Technician is not available on ${selectedDayFull}`);
    }
  }

  // Validate working hours
  if (bookingData.scheduledTime && technician.workingHours) {
    const { start, end } = technician.workingHours;
    if (start && end) {
      if (bookingData.scheduledTime < start || bookingData.scheduledTime > end) {
        throw new Error(`Technician is only available between ${start} and ${end}`);
      }
    }
  }

  // 3. Enforce 2-hour scheduling buffer conflict check
  if (bookingData.scheduledDate && bookingData.scheduledTime) {
    const requestedStart = combineDateTime(bookingData.scheduledDate, bookingData.scheduledTime);
    const bufferMs = 2 * 60 * 60 * 1000; // 2 hours buffer

    // Find all active bookings for this technician (pending or accepted)
    const activeBookings = await Booking.find({
      technician: bookingData.technician,
      status: { $in: ['pending', 'accepted'] }
    });

    for (const existing of activeBookings) {
      const existingStart = combineDateTime(existing.scheduledDate, existing.scheduledTime);
      const diffMs = Math.abs(requestedStart.getTime() - existingStart.getTime());
      
      if (diffMs < bufferMs) {
        const timeFormatter = new Intl.DateTimeFormat('en-IN', {
          hour: 'numeric',
          minute: 'numeric',
          hour12: true
        });
        const dateFormatter = new Intl.DateTimeFormat('en-IN', {
          dateStyle: 'medium'
        });
        
        const formattedDate = dateFormatter.format(existingStart);
        const formattedExistingTime = timeFormatter.format(existingStart);
        const freeTime = new Date(existingStart.getTime() + bufferMs);
        const formattedFreeTime = timeFormatter.format(freeTime);
        
        throw new Error(
          `Technician conflict: This technician is already booked on ${formattedDate} at ${formattedExistingTime} and won't be available until ${formattedFreeTime}. Please choose a time at least 2 hours apart.`
        );
      }
    }
  }

  const booking = await Booking.create(bookingData);
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
