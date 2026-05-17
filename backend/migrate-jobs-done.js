const mongoose = require('mongoose');
const Technician = require('./models/Technician');
const Booking = require('./models/Booking');
require('dotenv').config();

const migrateJobsDone = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const technicians = await Technician.find();
    console.log(`Found ${technicians.length} technicians`);

    for (const tech of technicians) {
      const completedCount = await Booking.countDocuments({
        technician: tech._id,
        status: 'completed'
      });
      
      tech.jobsDone = completedCount;
      await tech.save();
      console.log(`Updated technician ${tech._id}: ${completedCount} jobs done`);
    }

    console.log('Migration completed');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrateJobsDone();
