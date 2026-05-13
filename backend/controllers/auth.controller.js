const authService = require('../services/auth.service');

// @desc    Register user or technician
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const userData = await authService.registerUser(req.body);

    res.status(201).json({
      success: true,
      data: userData,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const userData = await authService.loginUser(email, password);

    res.status(200).json({
      success: true,
      data: userData,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
};
