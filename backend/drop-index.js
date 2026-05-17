const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Review = require('./models/Review');

dotenv.config({ path: './.env' });

const dropIndex = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected');
    
    // Drop the old index
    await Review.collection.dropIndex('technicianId_1_userId_1');
    console.log('Successfully dropped old unique index');
    
    process.exit(0);
  } catch (err) {
    if (err.codeName === 'IndexNotFound') {
      console.log('Index already dropped or does not exist');
      process.exit(0);
    } else {
      console.error('Error dropping index:', err);
      process.exit(1);
    }
  }
};

dropIndex();
