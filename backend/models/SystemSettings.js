const mongoose = require('mongoose');

const systemSettingsSchema = new mongoose.Schema(
  {
    commissionRate: {
      type: Number,
      required: [true, 'Please add commission rate'],
      default: 15,
      min: 0,
      max: 100
    },
    baseBookingFee: {
      type: Number,
      required: [true, 'Please add base booking fee'],
      default: 99,
      min: 0
    },
    taxRate: {
      type: Number,
      required: [true, 'Please add tax rate'],
      default: 18,
      min: 0,
      max: 100
    },
    requireIdentityVerification: {
      type: Boolean,
      default: true
    },
    requirePortfolioVerification: {
      type: Boolean,
      default: true
    },
    autoApproveTechnicians: {
      type: Boolean,
      default: false
    },
    supportEmail: {
      type: String,
      required: [true, 'Please add support email'],
      default: 'support@keebo.com'
    },
    supportPhone: {
      type: String,
      required: [true, 'Please add support phone'],
      default: '+91 98765 43210'
    },
    maxActiveBookingsPerTech: {
      type: Number,
      required: [true, 'Please add max active bookings per technician'],
      default: 5,
      min: 1
    },
    upiqrCodeUrl: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('SystemSettings', systemSettingsSchema);
