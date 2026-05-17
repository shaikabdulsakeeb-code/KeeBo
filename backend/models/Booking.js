const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    technician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Technician',
      required: true,
    },
    service: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
      default: 'pending',
    },
    price: {
      type: Number,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    scheduledDate: {
      type: Date,
      required: true,
    },
    scheduledTime: {
      type: String,
      required: true,
    },
    userPhoneNumber: {
      type: String,
      required: true,
    },
    notes: String,
    isReviewed: {
      type: Boolean,
      default: false,
    },
    cancelledBy: {
      type: String,
      enum: ['user', 'technician', 'admin'],
    },
    cancelledAt: {
      type: Date,
    },
    commissionCharged: {
      type: Number,
      default: 0,
    },
    taxCharged: {
      type: Number,
      default: 0,
    },
    platformCharges: {
      type: Number,
      default: 0,
    },
    netTechnicianEarnings: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save transaction hook for completed bookings
bookingSchema.pre('save', async function () {
  // Only trigger if status has changed to 'completed'
  if (this.isModified('status') && this.status === 'completed') {
    const SystemSettings = mongoose.model('SystemSettings');
    const Technician = mongoose.model('Technician');

    // Fetch active platform settings
    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = await SystemSettings.create({});
    }

    // Calculations: Platform Commission + Tax (GST) on that commission
    const commission = this.price * (settings.commissionRate / 100);
    const tax = commission * (settings.taxRate / 100);
    const totalCharges = commission + tax;
    const netEarnings = this.price - totalCharges;

    // Populate precise transaction audit logs
    this.commissionCharged = Math.round(commission * 100) / 100;
    this.taxCharged = Math.round(tax * 100) / 100;
    this.platformCharges = Math.round(totalCharges * 100) / 100;
    this.netTechnicianEarnings = Math.round(netEarnings * 100) / 100;

    // Update technician's ledger profile
    const technician = await Technician.findById(this.technician);
    if (technician) {
      technician.jobsDone += 1;
      technician.outstandingDues = Math.round((technician.outstandingDues + this.platformCharges) * 100) / 100;
      technician.totalEarnings = Math.round((technician.totalEarnings + this.netTechnicianEarnings) * 100) / 100;

      // Perform weekly dues check:
      // Set paymentStatus to due/overdue if they have outstanding dues
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      if (technician.lastPaymentDate < oneWeekAgo) {
        technician.paymentStatus = 'overdue';
      } else {
        technician.paymentStatus = 'due';
      }

      await technician.save();
    }
  }
});

module.exports = mongoose.model('Booking', bookingSchema);
