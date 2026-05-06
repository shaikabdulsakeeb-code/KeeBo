const Technician = require('../models/Technician');
const APIFeatures = require('../utils/apiFeatures');
const cloudinary = require('../config/cloudinary');

// Helper to upload buffer to cloudinary via base64
const uploadToCloudinary = async (file, folder) => {
  const b64 = Buffer.from(file.buffer).toString('base64');
  let dataURI = 'data:' + file.mimetype + ';base64,' + b64;
  const result = await cloudinary.uploader.upload(dataURI, {
    folder: folder,
  });
  return result.secure_url;
};

// @desc    Create technician profile
// @route   POST /api/technicians/profile
// @access  Private (Technician only)
const createProfile = async (req, res, next) => {
  try {
    let existingProfile = await Technician.findOne({ userId: req.user._id });
    if (existingProfile) {
      res.status(400);
      return next(new Error('Profile already exists'));
    }

    const { category, experience, pricing, serviceAreas, phoneNumber } = req.body;
    let serviceAreasArray = serviceAreas;
    if (typeof serviceAreas === 'string') {
        serviceAreasArray = serviceAreas.split(',').map(s => s.trim());
    }

    let profileImageUrl = 'default.jpg';
    let workImagesUrls = [];

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
    }

    const profile = await Technician.create({
      userId: req.user._id,
      category,
      experience,
      pricing,
      phoneNumber,
      serviceAreas: serviceAreasArray,
      profileImage: profileImageUrl,
      workImages: workImagesUrls,
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
    let profile = await Technician.findOne({ userId: req.user._id });

    if (!profile) {
      res.status(404);
      return next(new Error('Profile not found'));
    }

    const { category, experience, pricing, serviceAreas, phoneNumber } = req.body;
    
    if (category) profile.category = category;
    if (experience) profile.experience = experience;
    if (pricing) profile.pricing = pricing;
    if (phoneNumber) profile.phoneNumber = phoneNumber;
    if (serviceAreas) {
        profile.serviceAreas = typeof serviceAreas === 'string' ? serviceAreas.split(',').map(s => s.trim()) : serviceAreas;
    }

    if (req.files) {
      if (req.files.profileImage) {
        profile.profileImage = await uploadToCloudinary(
          req.files.profileImage[0],
          'hyperlocal/profiles'
        );
      }
      if (req.files.workImages) {
        for (const file of req.files.workImages) {
          const url = await uploadToCloudinary(file, 'hyperlocal/work');
          profile.workImages.push(url);
        }
      }
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

    res.status(200).json({
      success: true,
      data: profile,
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
    // We only want to show approved technicians to public
    let filter = { isApproved: 'approved' };

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

module.exports = {
  createProfile,
  updateProfile,
  getOwnProfile,
  getApprovedTechnicians,
};
