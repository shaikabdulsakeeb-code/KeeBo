const User = require('../models/User');

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

// @desc    Add technician to favorites
// @route   POST /api/users/favorites/:technicianId
// @access  Private
const addFavorite = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user.favorites.includes(req.params.technicianId)) {
      user.favorites.push(req.params.technicianId);
      await user.save();
    }
    res.status(200).json({ success: true, data: user.favorites });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove technician from favorites
// @route   DELETE /api/users/favorites/:technicianId
// @access  Private
const removeFavorite = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    user.favorites = user.favorites.filter(
      (id) => id.toString() !== req.params.technicianId
    );
    await user.save();
    res.status(200).json({ success: true, data: user.favorites });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user favorites
// @route   GET /api/users/favorites
// @access  Private
const getFavorites = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'favorites',
      populate: { path: 'userId', select: 'name email' }
    });
    res.status(200).json({ success: true, data: user.favorites });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserProfile,
  addFavorite,
  removeFavorite,
  getFavorites,
};
