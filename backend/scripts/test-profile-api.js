const mongoose = require('mongoose');
const User = require('../models/User');
const Technician = require('../models/Technician');
const SystemSettings = require('../models/SystemSettings');
const Settlement = require('../models/Settlement');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const testProfileApi = async () => {
  try {
    await mongoose.connect('mongodb+srv://SAKEEB:SAKEEB1234@mark1.9jarrmd.mongodb.net/KeeBo?retryWrites=true&w=majority');
    
    // Find the technician user
    const user = await User.findOne({ email: 'an@gmail.com' });
    if (!user) {
      console.log('User not found!');
      return;
    }

    const profile = await Technician.findOne({ userId: user._id });
    if (!profile) {
      console.log('Technician profile not found!');
      return;
    }

    const settings = await SystemSettings.findOne();
    const lastSettlement = await Settlement.findOne({ technician: profile._id }).sort('-createdAt');

    const profileObj = profile.toObject();
    profileObj.upiqrCodeUrl = settings ? settings.upiqrCodeUrl : '';
    profileObj.lastSettlement = lastSettlement || null;

    console.log('API Response data validation:');
    console.log('Profile ID:', profileObj._id);
    console.log('upiqrCodeUrl field present:', 'upiqrCodeUrl' in profileObj);
    console.log('upiqrCodeUrl length:', profileObj.upiqrCodeUrl ? profileObj.upiqrCodeUrl.length : 0);
    console.log('upiqrCodeUrl type:', typeof profileObj.upiqrCodeUrl);
    console.log('upiqrCodeUrl starts with:', profileObj.upiqrCodeUrl ? profileObj.upiqrCodeUrl.substring(0, 50) : 'None');

    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err);
  }
};

testProfileApi();
