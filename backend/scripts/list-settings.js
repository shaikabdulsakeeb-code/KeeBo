const mongoose = require('mongoose');
const SystemSettings = require('../models/SystemSettings');
require('dotenv').config();

const listSettings = async () => {
  try {
    await mongoose.connect('mongodb+srv://SAKEEB:SAKEEB1234@mark1.9jarrmd.mongodb.net/KeeBo?retryWrites=true&w=majority');
    const settings = await SystemSettings.find();
    console.log(`Found ${settings.length} documents in SystemSettings:`);
    settings.forEach((s, idx) => {
      console.log(`[Document ${idx + 1}] ID: ${s._id}, upiqrCodeUrl exists: ${!!s.upiqrCodeUrl}, length: ${s.upiqrCodeUrl ? s.upiqrCodeUrl.length : 0}`);
    });
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error listing settings:', err);
  }
};

listSettings();
