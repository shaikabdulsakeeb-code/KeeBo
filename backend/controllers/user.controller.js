const User = require('../models/User');
const Technician = require('../models/Technician');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/uploadHelpers');

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
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
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
    const technicianId = req.params.technicianId;
    
    // Check if user is a technician
    if (req.user.role === 'technician') {
      res.status(403);
      return next(new Error('Technicians cannot have favorites'));
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $addToSet: { favorites: technicianId } },
      { new: true, runValidators: false }
    );

    if (!user) {
      res.status(404);
      return next(new Error('User not found'));
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
    if (req.user.role === 'technician') {
      res.status(403);
      return next(new Error('Technicians cannot have favorites'));
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { favorites: req.params.technicianId } },
      { new: true, runValidators: false }
    );

    if (!user) {
      res.status(404);
      return next(new Error('User not found'));
    }

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
    if (req.user.role === 'technician') {
      return res.status(200).json({ success: true, data: [] });
    }

    const user = await User.findById(req.user._id).populate({
      path: 'favorites',
      match: { isSuspended: { $ne: true } },
      populate: { path: 'userId', select: 'name email' }
    });
    
    // Filter out any suspended technicians that mongoose populates as null
    const activeFavorites = (user.favorites || []).filter(fav => fav !== null);
    
    res.status(200).json({ success: true, data: activeFavorites });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile image
// @route   PUT /api/users/profile/image
// @access  Private
const updateProfileImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image'
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      return next(new Error('User not found'));
    }

    // Delete old image if it exists and is not the default
    if (user.profileImage && user.profileImage !== 'default.jpg') {
      try {
        await deleteFromCloudinary(user.profileImage);
      } catch (err) {
        console.error('Failed to delete old profile image:', err);
      }
    }

    // Determine folder based on role
    const uploadFolder = user.role === 'technician' ? 'hyperlocal/profiles' : 'hyperlocal/users';
    const imageUrl = await uploadToCloudinary(req.file, uploadFolder);
    
    user.profileImage = imageUrl;
    await user.save();

    // If user is a technician, also update their technician profile image
    if (user.role === 'technician') {
      await Technician.findOneAndUpdate(
        { userId: user._id },
        { profileImage: imageUrl }
      );
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Profile Image Upload Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal Server Error'
    });
  }
};

module.exports = {
  getUserProfile,
  addFavorite,
  removeFavorite,
  getFavorites,
  updateProfileImage,
};
