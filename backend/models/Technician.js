const mongoose = require('mongoose');

const technicianSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    category: {
      type: String,
      required: [true, 'Please add a category (e.g., plumber, electrician)'],
    },
    experience: {
      type: Number,
      required: [true, 'Please specify years of experience'],
      min: 0,
    },
    pricing: {
      type: Number,
      required: [true, 'Please specify your base pricing/hourly rate'],
    },
    phoneNumber: {
      type: String,
      required: [true, 'Please add a phone number'],
    },
    workingDays: {
      type: [String],
      default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    },
    workingHours: {
      start: { type: String, default: '09:00' },
      end: { type: String, default: '17:00' },
    },
    serviceAreas: {
      type: [String],
      required: [true, 'Please specify at least one service area'],
    },
    profileImage: {
      type: String,
      default: 'default.jpg',
    },
    workImages: {
      type: [String],
      default: [],
    },
    isApproved: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
      },
      coordinates: {
        type: [Number],
        index: '2dsphere',
      },
      address: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Technician', technicianSchema);
