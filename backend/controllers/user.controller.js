const User = require('../models/User');
const Review = require('../models/Review');
const Technician = require('../models/Technician');
const APIFeatures = require('../utils/apiFeatures');

// @desc    Add review for a technician
// @route   POST /api/users/reviews/:technicianId
// @access  Private (User only)
const addReview = async (req, res, next) => {
  try {
    const { technicianId } = req.params;
    const { rating, comment } = req.body;

    // Check if technician exists
    const technician = await Technician.findById(technicianId);
    if (!technician) {
      res.status(404);
      return next(new Error('Technician not found'));
    }

    const review = await Review.create({
      userId: req.user._id,
      technicianId: technicianId,
      rating: Number(rating),
      comment,
    });

    res.status(201).json({
      success: true,
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reviews for a specific technician
// @route   GET /api/users/reviews/:technicianId
// @access  Public
const getTechnicianReviews = async (req, res, next) => {
  try {
    const { technicianId } = req.params;

    const features = new APIFeatures(
      Review.find({ technicianId }).populate('userId', 'name'),
      req.query
    )
      .filter()
      .sort()
      .paginate();

    const reviews = await features.query;

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      res.status(200).json({
        success: true,
        data: user,
      });
    } else {
      res.status(404);
      return next(new Error('User not found'));
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addReview,
  getTechnicianReviews,
  getUserProfile,
};
