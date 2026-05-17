const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const ErrorResponse = require('../utils/errorResponse');

exports.registerUser = async (userData) => {
  const { name, email, password, role } = userData;

  // Prevent admin registration
  if (role === 'admin') {
    throw new ErrorResponse('Cannot register as an admin', 400);
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    throw new ErrorResponse('User already exists', 400);
  }

  const user = await User.create({
    name,
    email,
    password,
    role: role || 'user',
  });

  if (!user) {
    throw new ErrorResponse('Invalid user data', 400);
  }

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    profileImage: user.profileImage,
    token: generateToken(user._id),
  };
};

exports.loginUser = async (email, password) => {
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    throw new ErrorResponse('Invalid credentials', 401);
  }

  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    throw new ErrorResponse('Invalid credentials', 401);
  }

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    profileImage: user.profileImage,
    token: generateToken(user._id),
  };
};
