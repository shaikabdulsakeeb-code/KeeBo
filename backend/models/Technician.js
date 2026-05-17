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
    bio: {
      type: String,
      trim: true,
      maxLength: [500, 'Bio cannot be more than 500 characters'],
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
    idVerification: {
      type: String,
    },
    isApproved: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    rejectionReason: {
      type: String,
      default: '',
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
    jobsDone: {
      type: Number,
      default: 0,
    },
    outstandingDues: {
      type: Number,
      default: 0,
    },
    totalEarnings: {
      type: Number,
      default: 0,
    },
    lastPaymentDate: {
      type: Date,
      default: Date.now,
    },
    paymentStatus: {
      type: String,
      enum: ['clear', 'due', 'overdue'],
      default: 'clear',
    },
    isSettlementPending: {
      type: Boolean,
      default: false,
    },
    isSuspended: {
      type: Boolean,
      default: false,
    },
    suspensionReason: {
      type: String,
      default: '',
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
