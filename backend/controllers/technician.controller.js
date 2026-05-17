const Technician = require('../models/Technician');
const APIFeatures = require('../utils/apiFeatures');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/uploadHelpers');
const SystemSettings = require('../models/SystemSettings');
const Settlement = require('../models/Settlement');

// @desc    Create technician profile
// @route   POST /api/technicians/profile
// @access  Private (Technician only)
const createProfile = async (req, res, next) => {
  try {
    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = await SystemSettings.create({});
    }


    let existingProfile = await Technician.findOne({ userId: req.user._id });
    if (existingProfile) {
      res.status(400);
      return next(new Error('Profile already exists'));
    }

    const { category, bio, experience, pricing, serviceAreas, phoneNumber, workingDays, workingHours } = req.body;
    
    let workingDaysArray = workingDays;
    if (typeof workingDays === 'string') {
        try {
            workingDaysArray = JSON.parse(workingDays);
        } catch (e) {
            workingDaysArray = workingDays.split(',').map(s => s.trim());
        }
    }

    let workingHoursObj = workingHours;
    if (typeof workingHours === 'string') {
        try {
            workingHoursObj = JSON.parse(workingHours);
        } catch (e) {
            // Default or ignore
        }
    }

    let serviceAreasArray = serviceAreas;
    if (typeof serviceAreas === 'string') {
        serviceAreasArray = serviceAreas.split(',').map(s => s.trim());
    }

    let profileImageUrl = 'default.jpg';
    let workImagesUrls = [];
    let idVerificationUrl = '';

    const { address, coordinates } = req.body;
    let locationObj = undefined;
    if (address && coordinates) {
      locationObj = {
        type: 'Point',
        coordinates: typeof coordinates === 'string' ? JSON.parse(coordinates) : coordinates,
        address
      };
    }

    if (req.files) {
      if (req.files.profileImage) {
        profileImageUrl = await uploadToCloudinary(
          req.files.profileImage[0],
          'hyperlocal/profiles'
        );
      }
      if (req.files.workImages) {
        for (const file of req.files.workImages) {
          const url = await uploadToCloudinary(file, 'hyperlocal/work');
          workImagesUrls.push(url);
        }
      }
      if (req.files.idVerification) {
        idVerificationUrl = await uploadToCloudinary(
          req.files.idVerification[0],
          'hyperlocal/verification'
        );
      }
    }

    if (settings.requireIdentityVerification && !idVerificationUrl) {
      res.status(400);
      return next(new Error('Identity verification document is required under current platform policies.'));
    }

    const profile = await Technician.create({
      userId: req.user._id,
      category,
      bio,
      experience,
      pricing,
      phoneNumber,
      serviceAreas: serviceAreasArray,
      profileImage: profileImageUrl,
      workImages: workImagesUrls,
      idVerification: idVerificationUrl,
      location: locationObj,
      workingDays: workingDaysArray,
      workingHours: workingHoursObj,
      isApproved: settings.autoApproveTechnicians ? 'approved' : 'pending'
    });

    res.status(201).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update technician profile
// @route   PUT /api/technicians/profile
// @access  Private (Technician only)
const updateProfile = async (req, res, next) => {
  try {
    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = await SystemSettings.create({});
    }


    let profile = await Technician.findOne({ userId: req.user._id });

    if (!profile) {
      res.status(404);
      return next(new Error('Profile not found'));
    }

    const { category, bio, experience, pricing, serviceAreas, phoneNumber, workingDays, workingHours } = req.body;
    
    // Capture original values for change detection
    const originalCategory = profile.category;
    const originalProfileImage = profile.profileImage;
    const originalIdVerification = profile.idVerification;

    if (category) profile.category = category;
    if (bio) profile.bio = bio;
    if (experience) profile.experience = experience;
    if (pricing) profile.pricing = pricing;
    if (phoneNumber) profile.phoneNumber = phoneNumber;
    
    if (workingDays) {
      profile.workingDays = typeof workingDays === 'string' ? JSON.parse(workingDays) : workingDays;
    }
    
    if (workingHours) {
      profile.workingHours = typeof workingHours === 'string' ? JSON.parse(workingHours) : workingHours;
    }

    if (serviceAreas) {
        profile.serviceAreas = typeof serviceAreas === 'string' ? serviceAreas.split(',').map(s => s.trim()) : serviceAreas;
    }

    const { address, coordinates } = req.body;
    if (address && coordinates) {
      profile.location = {
        type: 'Point',
        coordinates: typeof coordinates === 'string' ? JSON.parse(coordinates) : coordinates,
        address
      };
    }

    let filesUploaded = false;

    if (req.files) {
      if (req.files.profileImage && req.files.profileImage.length > 0) {
        // Delete old profile image if exists
        if (originalProfileImage && originalProfileImage !== 'default.jpg') {
            await deleteFromCloudinary(originalProfileImage);
        }
        profile.profileImage = await uploadToCloudinary(
          req.files.profileImage[0],
          'hyperlocal/profiles'
        );
        filesUploaded = true;
      }

      if (req.files.idVerification && req.files.idVerification.length > 0) {
        // Delete old ID verification if exists
        if (originalIdVerification) {
            await deleteFromCloudinary(originalIdVerification);
        }
        profile.idVerification = await uploadToCloudinary(
          req.files.idVerification[0],
          'hyperlocal/verification'
        );
        filesUploaded = true;
      }

      if (req.files.workImages && req.files.workImages.length > 0) {
        const updatedWorkImages = [];
        // 1. Keep existing images that were not deleted
        let existingToKeep = req.body.existingWorkImages;
        if (typeof existingToKeep === 'string') {
          try { existingToKeep = JSON.parse(existingToKeep); } catch(e) { existingToKeep = existingToKeep.split(',').map(s => s.trim()); }
        }
        
        const existingArray = Array.isArray(existingToKeep) ? existingToKeep : (existingToKeep ? [existingToKeep] : []);
        
        // Delete from cloudinary those that were removed
        if (profile.workImages) {
            const removed = profile.workImages.filter(img => !existingArray.includes(img));
            for (const url of removed) {
                await deleteFromCloudinary(url);
            }
        }

        updatedWorkImages.push(...existingArray);

        // 2. Add new images
        for (const file of req.files.workImages) {
          const url = await uploadToCloudinary(file, 'hyperlocal/work');
          updatedWorkImages.push(url);
        }
        
        profile.workImages = updatedWorkImages;
      } else if (Object.prototype.hasOwnProperty.call(req.body, 'existingWorkImages')) {
          // If no new work images but existing ones were provided (some might have been deleted)
          let existingToKeep = req.body.existingWorkImages;
          if (typeof existingToKeep === 'string') {
            try { existingToKeep = JSON.parse(existingToKeep); } catch(e) { existingToKeep = existingToKeep.split(',').map(s => s.trim()); }
          }
          const existingArray = Array.isArray(existingToKeep) ? existingToKeep : (existingToKeep ? [existingToKeep] : []);
          
          if (profile.workImages) {
              const removed = profile.workImages.filter(img => !existingArray.includes(img));
              for (const url of removed) {
                  await deleteFromCloudinary(url);
              }
          }
          profile.workImages = existingArray;
      }
    }

    // Check if ID verification is required by admin, and not already uploaded or being uploaded
    if (settings.requireIdentityVerification && !profile.idVerification && (!req.files || !req.files.idVerification)) {
      res.status(400);
      return next(new Error('Identity verification document is required under current platform policies.'));
    }

    // Reset approval status on update ONLY if critical fields ACTUALLY changed
    const categoryChanged = category && category !== originalCategory;
    const criticalFilesChanged = req.files && (
        (req.files.profileImage && req.files.profileImage.length > 0) || 
        (req.files.idVerification && req.files.idVerification.length > 0)
    );

    if (categoryChanged || criticalFilesChanged || profile.isApproved === 'rejected') {
      profile.isApproved = settings.autoApproveTechnicians ? 'approved' : 'pending';
      profile.rejectionReason = ''; // Clear the reason as they've resubmitted
    }

    await profile.save();

    res.status(200).json({
      success: true,
      data: profile,
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get own profile
// @route   GET /api/technicians/profile
// @access  Private (Technician only)
const getOwnProfile = async (req, res, next) => {
  try {
    const profile = await Technician.findOne({ userId: req.user._id }).populate(
      'userId',
      'name email'
    );

    if (!profile) {
      res.status(404);
      return next(new Error('Profile not found'));
    }

    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = await SystemSettings.create({});
    }

    const lastSettlement = await Settlement.findOne({ technician: profile._id }).sort('-createdAt');

    const profileObj = profile.toObject();
    profileObj.upiqrCodeUrl = settings.upiqrCodeUrl || '';
    profileObj.lastSettlement = lastSettlement || null;

    res.status(200).json({
      success: true,
      data: profileObj,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all approved technicians
// @route   GET /api/technicians
// @access  Public
const getApprovedTechnicians = async (req, res, next) => {
  try {
    let filter = { isApproved: 'approved', isSuspended: { $ne: true } };

    const features = new APIFeatures(Technician.find(filter).populate('userId', 'name email'), req.query)
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

// @desc    Get technicians within a radius
// @route   GET /api/technicians/radius/:zipcode/:distance
// @access  Public
const getTechniciansInRadius = async (req, res, next) => {
  try {
    const { lat, lng, distance } = req.params;
    const radius = distance / 6378;

    const technicians = await Technician.find({
      location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
      isApproved: 'approved',
      isSuspended: { $ne: true }
    }).populate('userId', 'name email');

    res.status(200).json({
      success: true,
      count: technicians.length,
      data: technicians,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single technician by ID
// @route   GET /api/technicians/:id
// @access  Public
const getTechnicianById = async (req, res, next) => {
  try {
    const technician = await Technician.findById(req.params.id).populate(
      'userId',
      'name email'
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

// @desc    Get service statistics (counts per category)
// @route   GET /api/technicians/stats/services
// @access  Public
const getServiceStats = async (req, res, next) => {
  try {
    const stats = await Technician.aggregate([
      { $match: { isApproved: 'approved', isSuspended: { $ne: true } } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit outstanding dues payment request (UPI scanner submission)
// @route   POST /api/technicians/pay-dues
// @access  Private (Technician only)
const payDues = async (req, res, next) => {
  try {
    const technician = await Technician.findOne({ userId: req.user._id });
    if (!technician) {
      res.status(404);
      return next(new Error('Technician profile not found'));
    }

    if (technician.outstandingDues <= 0) {
      res.status(400);
      return next(new Error('No outstanding dues to pay'));
    }

    if (technician.isSettlementPending) {
      res.status(400);
      return next(new Error('A prior payment verification is already pending admin review.'));
    }

    const { transactionRef, screenshot } = req.body;
    
    if (!transactionRef) {
      res.status(400);
      return next(new Error('UPI Transaction Reference code is required.'));
    }

    // Create a pending settlement request
    await Settlement.create({
      technician: technician._id,
      user: req.user._id,
      amount: technician.outstandingDues,
      status: 'pending',
      transactionRef,
      screenshot: screenshot || ''
    });

    // Mark as pending admin verification
    technician.isSettlementPending = true;
    await technician.save();

    res.status(200).json({
      success: true,
      message: 'UPI payment submitted for Admin verification successfully!',
      data: technician
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProfile,
  updateProfile,
  getOwnProfile,
  getApprovedTechnicians,
  getTechniciansInRadius,
  getTechnicianById,
  getServiceStats,
  payDues,
};
