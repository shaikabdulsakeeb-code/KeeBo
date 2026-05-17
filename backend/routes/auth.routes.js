const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/auth.controller');
const { validateRegister, validateLogin } = require('../validators/auth.validator');
const SystemSettings = require('../models/SystemSettings');

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);

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
