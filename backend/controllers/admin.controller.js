const User = require('../models/User');
const Technician = require('../models/Technician');
const APIFeatures = require('../utils/apiFeatures');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin only)
const getAllUsers = async (req, res, next) => {
  try {
    const features = new APIFeatures(User.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const users = await features.query;

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete/Block user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin only)
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(404);
      return next(new Error('User not found'));
    }

    // In a real app we might just set an `isActive` flag to false instead of deleting
    await User.findByIdAndDelete(req.params.id);

    // Also delete their technician profile if they have one
    await Technician.findOneAndDelete({ userId: req.params.id });

    res.status(200).json({
      success: true,
      data: {},
      message: 'User deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all technicians (including pending/rejected)
// @route   GET /api/admin/technicians
// @access  Private (Admin only)
const getAllTechniciansAdmin = async (req, res, next) => {
  try {
    const features = new APIFeatures(
      Technician.find().populate('userId', 'name email'),
      req.query
    )
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const technicians = await features.query;

    res.status(200).json({
      success: true,
      count: technicians.length,
      data: technicians,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve or Reject technician
// @route   PUT /api/admin/technicians/:id/status
// @access  Private (Admin only)
const updateTechnicianStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      res.status(400);
      return next(new Error('Invalid status'));
    }

    const technician = await Technician.findByIdAndUpdate(
      req.params.id,
      { isApproved: status },
      { new: true, runValidators: true }
    );

    if (!technician) {
      res.status(404);
      return next(new Error('Technician not found'));
    }

    res.status(200).json({
      success: true,
      data: technician,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  deleteUser,
  getAllTechniciansAdmin,
  updateTechnicianStatus,
};
