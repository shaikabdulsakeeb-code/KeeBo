const User = require('../models/User');
const Technician = require('../models/Technician');
const Booking = require('../models/Booking');
const asyncHandler = require('../middleware/async.middleware');

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getStats = asyncHandler(async (req, res, next) => {
  const totalUsers = await User.countDocuments({ role: 'user' });
  const totalTechnicians = await User.countDocuments({ role: 'technician' });
  const totalBookings = await Booking.countDocuments();
  
  // Calculate total revenue (sum of prices of completed bookings)
  const completedBookings = await Booking.find({ status: 'completed' });
  const totalRevenue = completedBookings.reduce((acc, curr) => acc + (curr.price || 0), 0);

  // Get verification queue count
  const pendingVerifications = await Technician.countDocuments({ isApproved: 'pending' });

  res.status(200).json({
    success: true,
    data: {
      totalUsers,
      totalTechnicians,
      totalBookings,
      totalRevenue,
      pendingVerifications,
      activeUsers: totalUsers + totalTechnicians // Simplified
    }
  });
});

// @desc    Get all technicians for verification
// @route   GET /api/admin/technicians
// @access  Private/Admin
exports.getTechnicians = asyncHandler(async (req, res, next) => {
  const technicians = await Technician.find().populate('userId', 'name email');
  
  res.status(200).json({
    success: true,
    data: technicians
  });
});

// @desc    Approve/Reject technician
// @route   PUT /api/admin/technicians/:id/verify
// @access  Private/Admin
exports.verifyTechnician = asyncHandler(async (req, res, next) => {
  const { status } = req.body; // 'approved' or 'rejected'
  
  const technician = await Technician.findById(req.params.id);
  if (!technician) {
    res.status(404);
    return next(new Error('Technician not found'));
  }

  technician.isApproved = status;
  await technician.save();

  res.status(200).json({
    success: true,
    data: technician
  });
});
// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find({ role: { $ne: 'admin' } });
  
  res.status(200).json({
    success: true,
    data: users
  });
});

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  
  if (!user) {
    res.status(404);
    return next(new Error('User not found'));
  }

  await user.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get all bookings
// @route   GET /api/admin/bookings
// @access  Private/Admin
exports.getAllBookings = asyncHandler(async (req, res, next) => {
  const bookings = await Booking.find()
    .populate('user', 'name email')
    .populate('technician');

  res.status(200).json({
    success: true,
    data: bookings
  });
});
