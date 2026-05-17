const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const { register, login, forgotPassword, verifyOtp, resetPassword } = require('../controllers/auth.controller');
const { validateRegister, validateLogin } = require('../validators/auth.validator');
const SystemSettings = require('../models/SystemSettings');

// Rate limiter for OTP requests: max 5 per 15 minutes per IP
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Too many requests. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);

// Password Reset OTP Flow
router.post('/forgot-password', otpLimiter, forgotPassword);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);

// @desc    Get public system contact settings
// @route   GET /api/auth/settings
// @access  Public
router.get('/settings', async (req, res, next) => {
  try {
    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = await SystemSettings.create({});
    }
    res.status(200).json({
      success: true,
      data: {
        supportEmail: settings.supportEmail,
        supportPhone: settings.supportPhone
      }
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
