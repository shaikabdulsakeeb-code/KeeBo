const User = require('../models/User');
const Technician = require('../models/Technician');
const Booking = require('../models/Booking');
const SystemSettings = require('../models/SystemSettings');
const asyncHandler = require('../middleware/async.middleware');
const APIFeatures = require('../utils/apiFeatures');
const Settlement = require('../models/Settlement');
const mongoose = require('mongoose');

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getStats = asyncHandler(async (req, res, next) => {
  const totalUsers = await User.countDocuments({ role: 'user' });
  const totalTechnicians = await User.countDocuments({ role: 'technician' });
  const totalBookings = await Booking.countDocuments();
  
  // Calculate total customer revenue (sum of prices of completed bookings)
  const completedBookings = await Booking.find({ status: 'completed' });
  const totalRevenue = completedBookings.reduce((acc, curr) => acc + (curr.price || 0), 0);

  // Calculate actual platform earnings (commissions + taxes) on completed bookings
  const totalPlatformEarnings = completedBookings.reduce((acc, curr) => acc + (curr.platformCharges || 0), 0);
  const avgPlatformEarning = completedBookings.length > 0 ? (totalPlatformEarnings / completedBookings.length) : 0;

  // Calculate total outstanding dues to be paid by technicians to the platform
  const techniciansList = await Technician.find();
  const totalOutstandingDues = techniciansList.reduce((acc, t) => acc + (t.outstandingDues || 0), 0);

  // Get verification queue count
  const pendingVerifications = await Technician.countDocuments({ isApproved: 'pending' });

  // 1. Generate Last 7 Days template
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString('default', { weekday: 'short' });
    last7Days.push({ date: dateStr, day: dayName, count: 0, revenue: 0 });
  }

  // 2. Aggregate bookings of the last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const bookingAgg = await Booking.aggregate([
    {
      $match: {
        createdAt: { $gte: sevenDaysAgo }
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 },
        revenue: { $sum: { $ifNull: ['$price', 0] } }
      }
    }
  ]);

  // Merge aggregated stats back into last7Days
  bookingAgg.forEach(item => {
    const found = last7Days.find(d => d.date === item._id);
    if (found) {
      found.count = item.count;
      found.revenue = item.revenue;
    }
  });

  // 3. Aggregate service distribution (count bookings by category)
  const categoryDistribution = await Booking.aggregate([
    {
      $lookup: {
        from: 'technicians',
        localField: 'technician',
        foreignField: '_id',
        as: 'techProfile'
      }
    },
    {
      $unwind: {
        path: '$techProfile',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $group: {
        _id: '$techProfile.category',
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } }
  ]);

  res.status(200).json({
    success: true,
    data: {
      totalUsers,
      totalTechnicians,
      totalBookings,
      totalRevenue,
      pendingVerifications,
      totalPlatformEarnings: Math.round(totalPlatformEarnings * 100) / 100,
      avgPlatformEarning: Math.round(avgPlatformEarning * 100) / 100,
      totalOutstandingDues: Math.round(totalOutstandingDues * 100) / 100,
      activeUsers: totalUsers + totalTechnicians,
      dailyTrend: last7Days,
      categoryDistribution: categoryDistribution.map(c => ({
        category: c._id || 'General',
        count: c.count
      }))
    }
  });
});

// @desc    Get all technicians with search, filter, and pagination
// @route   GET /api/admin/technicians
// @access  Private/Admin
exports.getTechnicians = asyncHandler(async (req, res, next) => {
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 7;
  const skip = (page - 1) * limit;
  const search = req.query.search || '';
  const category = req.query.category || '';
  const isApproved = req.query.isApproved || '';

  const pipeline = [
    // Join with Users collection
    {
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'userId'
      }
    },
    { $unwind: { path: '$userId', preserveNullAndEmptyArrays: true } },
    // Filter by category if provided
    ...(category ? [{ $match: { category: category } }] : []),
    // Filter by approval status if provided
    ...(isApproved ? [{ $match: { isApproved: isApproved } }] : []),
    // Search by name, category or address
    ...(search ? [{
      $match: {
        $or: [
          { 'userId.name': { $regex: search, $options: 'i' } },
          { category: { $regex: search, $options: 'i' } },
          { 'location.address': { $regex: search, $options: 'i' } },
          { address: { $regex: search, $options: 'i' } }
        ]
      }
    }] : []),
    // Sorting
    { $sort: { createdAt: -1 } },
    // Pagination
    {
      $facet: {
        data: [{ $skip: skip }, { $limit: limit }],
        totalCount: [{ $count: 'count' }]
      }
    }
  ];

  const results = await Technician.aggregate(pipeline);
  const technicians = results[0].data;
  const totalCount = results[0].totalCount[0]?.count || 0;

  res.status(200).json({
    success: true,
    count: technicians.length,
    totalCount,
    data: technicians
  });
});

// @desc    Delete technician profile
// @route   DELETE /api/admin/technicians/:id
// @access  Private/Admin
exports.deleteTechnician = asyncHandler(async (req, res, next) => {
  const technician = await Technician.findById(req.params.id);
  
  if (!technician) {
    res.status(404);
    return next(new Error('Technician not found'));
  }

  // Also update user role back to 'user' or just delete user? 
  // User says "remove technician", usually we delete the profile but keep the user?
  // Let's delete the profile.
  await technician.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get single technician by ID for admin
// @route   GET /api/admin/technicians/:id
// @access  Private/Admin
exports.getAdminTechnicianById = asyncHandler(async (req, res, next) => {
  const technician = await Technician.findById(req.params.id).populate('userId', 'name email');
  
  if (!technician) {
    res.status(404);
    return next(new Error('Technician not found'));
  }

  // Calculate days since last dues payment dynamically
  const techObj = technician.toObject();
  const lastPay = techObj.lastPaymentDate || techObj.createdAt || new Date();
  const diffTime = Math.abs(new Date() - new Date(lastPay));
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  techObj.daysSinceLastPayment = diffDays;

  res.status(200).json({
    success: true,
    data: techObj
  });
});

// @desc    Approve/Reject technician
// @route   PUT /api/admin/technicians/:id/verify
// @access  Private/Admin
exports.verifyTechnician = asyncHandler(async (req, res, next) => {
  const { status, rejectionReason } = req.body; // 'approved' or 'rejected'
  
  const technician = await Technician.findById(req.params.id);
  if (!technician) {
    res.status(404);
    return next(new Error('Technician not found'));
  }

  technician.isApproved = status;
  if (status === 'rejected') {
    technician.rejectionReason = rejectionReason || 'No reason provided';
  } else {
    technician.rejectionReason = '';
  }

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
  const search = req.query.search || '';
  const role = req.query.role || 'all';
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;
  
  const matchQuery = { role: { $ne: 'admin' } };
  
  if (role !== 'all') {
    matchQuery.role = role;
  }
  
  if (search) {
    matchQuery.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  const pipeline = [
    { $match: matchQuery },
    // Join with Technician collection to get their specific profile image if it exists
    {
      $lookup: {
        from: 'technicians',
        localField: '_id',
        foreignField: 'userId',
        as: 'techProfile'
      }
    },
    { $unwind: { path: '$techProfile', preserveNullAndEmptyArrays: true } },
    { $sort: { createdAt: -1 } },
    {
      $facet: {
        metadata: [{ $count: 'total' }],
        data: [{ $skip: skip }, { $limit: limit }]
      }
    }
  ];

  const results = await User.aggregate(pipeline);
  const users = results[0].data;
  const totalCount = results[0].metadata[0]?.total || 0;
  
  res.status(200).json({
    success: true,
    count: users.length,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
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

// @desc    Get all bookings with stats and filters
// @route   GET /api/admin/bookings
// @access  Private/Admin
exports.getAllBookings = asyncHandler(async (req, res, next) => {
  const status = req.query.status || 'all';
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const query = {};
  if (status !== 'all') {
    query.status = { $regex: new RegExp(`^${status}$`, 'i') };
  }

  // Get statistics
  const stats = {
    total: await Booking.countDocuments(),
    pending: await Booking.countDocuments({ status: 'pending' }),
    accepted: await Booking.countDocuments({ status: 'accepted' }),
    completed: await Booking.countDocuments({ status: 'completed' }),
    cancelled: await Booking.countDocuments({ status: 'cancelled' }),
    rejected: await Booking.countDocuments({ status: 'rejected' }),
    totalRevenue: (await Booking.find({ status: 'completed' })).reduce((acc, b) => acc + (b.price || 0), 0)
  };

  const totalCount = await Booking.countDocuments(query);
  const bookings = await Booking.find(query)
    .populate('user', 'name email profileImage')
    .populate({
      path: 'technician',
      populate: { path: 'userId', select: 'name profileImage' }
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    success: true,
    count: bookings.length,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
    stats,
    data: bookings
  });
});

// @desc    Update any booking status (Admin intervention)
// @route   PUT /api/admin/bookings/:id/status
// @access  Private/Admin
exports.updateAdminBookingStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    res.status(404);
    return next(new Error('Booking not found'));
  }

  const oldStatus = booking.status;
  booking.status = status;
  
  if (status === 'cancelled') {
    booking.cancelledBy = 'admin';
    booking.cancelledAt = new Date();
  }
  
  await booking.save();

  res.status(200).json({
    success: true,
    data: booking
  });
});

// @desc    Delete a booking
// @route   DELETE /api/admin/bookings/:id
// @access  Private/Admin
exports.deleteBooking = asyncHandler(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    res.status(404);
    return next(new Error('Booking not found'));
  }

  await booking.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get global system settings
// @route   GET /api/admin/settings
// @access  Private/Admin
exports.getSettings = asyncHandler(async (req, res, next) => {
  let settings = await SystemSettings.findOne();
  
  if (!settings) {
    settings = await SystemSettings.create({});
  }

  res.status(200).json({
    success: true,
    data: settings
  });
});

// @desc    Update global system settings
// @route   PUT /api/admin/settings
// @access  Private/Admin
exports.updateSettings = asyncHandler(async (req, res, next) => {
  let settings = await SystemSettings.findOne();
  
  if (!settings) {
    settings = await SystemSettings.create({});
  }

  settings = await SystemSettings.findByIdAndUpdate(settings._id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: settings
  });
});

// @desc    Get all settlement requests
// @route   GET /api/admin/settlements
// @access  Private/Admin
exports.getSettlements = asyncHandler(async (req, res, next) => {
  const settlements = await Settlement.find()
    .populate('user', 'name email')
    .populate({
      path: 'technician',
      populate: { path: 'userId', select: 'name email' }
    })
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    data: settlements
  });
});

// @desc    Verify (approve or reject) a dues settlement payment
// @route   PUT /api/admin/settlements/:id
// @access  Private/Admin
exports.verifySettlement = asyncHandler(async (req, res, next) => {
  const { status, rejectionReason, remainingDues } = req.body; // 'approved' or 'rejected', remainingDues optional
  
  if (!['approved', 'rejected'].includes(status)) {
    res.status(400);
    return next(new Error('Invalid verification status'));
  }

  const settlement = await Settlement.findById(req.params.id);
  if (!settlement) {
    res.status(404);
    return next(new Error('Settlement request not found'));
  }

  if (settlement.status !== 'pending') {
    res.status(400);
    return next(new Error('Settlement has already been processed'));
  }

  const parsedRemainingDues = remainingDues !== undefined && remainingDues !== '' ? Number(remainingDues) : undefined;
  const hasRemainingDues = typeof parsedRemainingDues === 'number' && !isNaN(parsedRemainingDues) && parsedRemainingDues >= 0;

  settlement.status = status;
  if (status === 'rejected') {
    settlement.rejectionReason = rejectionReason || 'Receipt verification failed. Please check details or upload a valid screenshot.';
  } else if (status === 'approved' && hasRemainingDues) {
    settlement.remainingDues = parsedRemainingDues;
  }
  await settlement.save();

  // Load associated technician profile
  const technician = await Technician.findById(settlement.technician);
  
  if (technician) {
    if (status === 'approved') {
      const finalRemainingDues = hasRemainingDues ? parsedRemainingDues : 0;
      // Set remaining platform dues (can be partial payment)
      technician.outstandingDues = finalRemainingDues;
      technician.lastPaymentDate = new Date();
      technician.paymentStatus = finalRemainingDues > 0 ? 'due' : 'clear';
      technician.isSettlementPending = false;
      
      // Auto-reactivate account if dues are fully cleared
      if (finalRemainingDues === 0) {
        technician.isSuspended = false;
        technician.suspensionReason = '';
      }
    } else {
      // Rejection: keep outstanding dues, but clear pending status flag
      technician.isSettlementPending = false;
    }
    await technician.save();
  }

  res.status(200).json({
    success: true,
    message: `Payment request has been ${status} successfully!`,
    data: settlement
  });
});

// @desc    Toggle technician suspension status (Admin action)
// @route   PUT /api/admin/technicians/:id/suspend
// @access  Private/Admin
exports.toggleSuspendTechnician = asyncHandler(async (req, res, next) => {
  const technician = await Technician.findById(req.params.id);
  
  if (!technician) {
    res.status(404);
    return next(new Error('Technician profile not found'));
  }

  technician.isSuspended = !technician.isSuspended;
  
  if (technician.isSuspended) {
    technician.suspensionReason = req.body.suspensionReason || 'Suspended by platform administration.';
  } else {
    technician.suspensionReason = '';
  }
  
  await technician.save();

  res.status(200).json({
    success: true,
    message: `Technician has been ${technician.isSuspended ? 'suspended and hidden from user listings' : 'reactivated'} successfully!`,
    data: technician
  });
});
