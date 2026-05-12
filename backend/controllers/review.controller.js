const mongoose = require('mongoose');
const Review = require('../models/Review');
const Technician = require('../models/Technician');
const asyncHandler = require('../middleware/async.middleware');
const ErrorResponse = require('../utils/errorResponse');

/**
 * @desc    Helper to recalculate average rating for a technician
 */
const updateTechnicianRating = async (technicianId) => {
  const stats = await Review.aggregate([
    { $match: { technicianId: new mongoose.Types.ObjectId(technicianId) } },
    {
      $group: {
        _id: '$technicianId',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await Technician.findByIdAndUpdate(technicianId, {
      averageRating: Math.round(stats[0].averageRating * 10) / 10,
      totalReviews: stats[0].totalReviews,
    });
  } else {
    await Technician.findByIdAndUpdate(technicianId, {
      averageRating: 0,
      totalReviews: 0,
    });
  }
};

// @desc    Add review for a technician
// @route   POST /api/technicians/:technicianId/reviews
// @access  Private/User
exports.addReview = asyncHandler(async (req, res, next) => {
  const { rating, comment } = req.body;
  const { technicianId } = req.params;
  const userId = req.user.id;

  if (!technicianId || !userId) {
    return next(new ErrorResponse('Technician ID or User ID missing', 400));
  }

  const technician = await Technician.findById(technicianId);
  if (!technician) {
    return next(new ErrorResponse('Technician not found', 404));
  }

  // Check if already reviewed
  let review = await Review.findOne({ userId, technicianId });

  if (review) {
    review.rating = rating;
    review.comment = comment;
    await review.save();
  } else {
    review = await Review.create({
      rating,
      comment,
      technicianId,
      userId
    });
  }

  await updateTechnicianRating(technicianId);

  res.status(201).json({
    success: true,
    data: review
  });
});

// @desc    Get reviews for a technician
exports.getReviews = asyncHandler(async (req, res, next) => {
  const reviews = await Review.find({ technicianId: req.params.technicianId })
    .populate('userId', 'name')
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    count: reviews.length,
    data: reviews,
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
