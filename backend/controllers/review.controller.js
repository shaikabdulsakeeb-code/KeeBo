const mongoose = require('mongoose');
const Review = require('../models/Review');
const Technician = require('../models/Technician');
const Booking = require('../models/Booking');
const asyncHandler = require('../middleware/async.middleware');
const ErrorResponse = require('../utils/errorResponse');

/**
 * @desc    Helper to recalculate average rating for a technician
 */
const updateTechnicianRating = async (technicianId) => {
  try {
    const techObjectId = new mongoose.Types.ObjectId(technicianId);
    const stats = await Review.aggregate([
      { $match: { technicianId: techObjectId } },
      {
        $group: {
          _id: '$technicianId',
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    if (stats.length > 0) {
      await Technician.findByIdAndUpdate(techObjectId, {
        averageRating: Math.round(stats[0].averageRating * 10) / 10,
        totalReviews: stats[0].totalReviews,
      });
    } else {
      await Technician.findByIdAndUpdate(techObjectId, {
        averageRating: 0,
        totalReviews: 0,
      });
    }
  } catch (err) {
    console.error('Error updating technician rating:', err);
  }
};

// @desc    Add review for a technician
// @route   POST /api/technicians/:technicianId/reviews
// @access  Private/User
exports.addReview = asyncHandler(async (req, res, next) => {
  const { rating, comment, bookingId } = req.body;
  const { technicianId } = req.params;
  const userId = req.user.id;

  if (!technicianId || !mongoose.Types.ObjectId.isValid(technicianId)) {
    return next(new ErrorResponse('Valid Technician ID is required', 400));
  }

  const technician = await Technician.findById(technicianId);
  if (!technician) {
    return next(new ErrorResponse('Technician not found', 404));
  }

  // Ensure user has a completed booking with this technician
  const bookingCriteria = {
    user: new mongoose.Types.ObjectId(userId),
    technician: new mongoose.Types.ObjectId(technicianId),
    status: 'completed'
  };
  
  if (bookingId && mongoose.Types.ObjectId.isValid(bookingId)) {
    bookingCriteria._id = new mongoose.Types.ObjectId(bookingId);
  }

  const completedBooking = await Booking.findOne(bookingCriteria);

  if (!completedBooking && req.user.role !== 'admin') {
    return next(new ErrorResponse('You can only review technicians after a completed service. Ensure the booking is marked as completed.', 403));
  }

  // Check if already reviewed this specific booking
  let review = null;
  if (completedBooking) {
    review = await Review.findOne({ bookingId: completedBooking._id });
  }

  if (review) {
    review.rating = Number(rating);
    review.comment = comment;
    await review.save();
  } else {
    review = await Review.create({
      rating: Number(rating),
      comment,
      technicianId,
      userId,
      bookingId: completedBooking._id
    });
  }

  // Update technician rating safely
  await updateTechnicianRating(technicianId);

  // Mark specific booking as reviewed if provided
  if (bookingId && mongoose.Types.ObjectId.isValid(bookingId)) {
    await Booking.findByIdAndUpdate(bookingId, { isReviewed: true });
  } else if (completedBooking) {
    completedBooking.isReviewed = true;
    await completedBooking.save();
  }

  // Emit real-time event for the new review
  const io = req.app.get('io');
  if (io) {
    // Notify the technician
    const Technician = require('../models/Technician');
    const techDoc = await Technician.findById(technicianId);
    if (techDoc) {
      io.to(techDoc.userId.toString()).emit('newReview', review);
    }
    // Notify admins
    io.to('admin_room').emit('newReview', review);
  }

  res.status(201).json({
    success: true,
    data: review
  });
});

// @desc    Get reviews for a technician
exports.getReviews = asyncHandler(async (req, res, next) => {
  const reviews = await Review.find({ technicianId: req.params.technicianId })
    .populate({
      path: 'userId',
      select: 'name'
    })
    .sort('-createdAt');

  // Map userId to user for frontend compatibility
  const data = reviews.map(review => {
    const obj = review.toObject();
    obj.user = obj.userId;
    return obj;
  });

  res.status(200).json({
    success: true,
    count: reviews.length,
    data: data,
  });
});


// @desc    Delete review
exports.deleteReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);
  if (!review) return next(new ErrorResponse('Review not found', 404));

  if (review.userId.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized', 401));
  }

  const technicianId = review.technicianId;
  await review.deleteOne();
  await updateTechnicianRating(technicianId);

  res.status(200).json({ success: true, data: {} });
});
