const ErrorResponse = require('../utils/errorResponse');

exports.validateRegister = (req, res, next) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return next(new ErrorResponse('Please provide name, email and password', 400));
  }

  // Basic email regex
  const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  if (!emailRegex.test(email)) {
    return next(new ErrorResponse('Please provide a valid email', 400));
  }

  if (password.length < 6) {
    return next(new ErrorResponse('Password must be at least 6 characters', 400));
  }

  // Prevent public admin registration
  if (role === 'admin') {
    return next(new ErrorResponse('Admin registration is not allowed publicly', 403));
  }

  next();
};

exports.validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorResponse('Please provide email and password', 400));
  }

  next();
};
