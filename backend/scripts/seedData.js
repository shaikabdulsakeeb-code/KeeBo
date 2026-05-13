const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Technician = require('../models/Technician');
const Booking = require('../models/Booking');
const connectDB = require('../config/db');

dotenv.config({ path: './.env' });

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany({ role: { $ne: 'admin' } });
    await Technician.deleteMany();
    await Booking.deleteMany();

    console.log('🗑️ Data cleared...');

    // Create a customer
    const customer = await User.create({
      name: 'Sarah Customer',
      email: 'customer@test.com',
      password: 'password123',
      role: 'user'
    });

    // Create 3 technicians
    const techUsers = await User.create([
      { name: 'Michael Chen', email: 'michael@tech.com', password: 'password123', role: 'technician' },
      { name: 'Alex Johnson', email: 'alex@tech.com', password: 'password123', role: 'technician' },
      { name: 'Emma Wilson', email: 'emma@tech.com', password: 'password123', role: 'technician' }
    ]);

    // Create Technician Profiles
    const tech1 = await Technician.create({
      userId: techUsers[0]._id,
      category: 'Electrician',
      experience: 8,
      pricing: 45,
      phoneNumber: '555-0101',
      serviceAreas: ['Downtown', 'Westside'],
      isApproved: 'approved',
      averageRating: 4.8,
      totalReviews: 12,
      profileImage: 'https://i.pravatar.cc/300?u=michael',
      location: { type: 'Point', coordinates: [-122.4194, 37.7749], address: '123 Power St' }
    });

    const tech2 = await Technician.create({
      userId: techUsers[1]._id,
      category: 'Plumber',
      experience: 5,
      pricing: 60,
      phoneNumber: '555-0202',
      serviceAreas: ['Eastside', 'Central'],
      isApproved: 'approved',
      averageRating: 4.5,
      totalReviews: 8,
      profileImage: 'https://i.pravatar.cc/300?u=alex',
      location: { type: 'Point', coordinates: [-122.4294, 37.7849], address: '456 Water Ave' }
    });

    const tech3 = await Technician.create({
      userId: techUsers[2]._id,
      category: 'HVAC Specialist',
      experience: 12,
      pricing: 75,
      phoneNumber: '555-0303',
      serviceAreas: ['Northside', 'Suburbs'],
      isApproved: 'approved',
      averageRating: 4.9,
      totalReviews: 24,
      profileImage: 'https://i.pravatar.cc/300?u=emma',
      location: { type: 'Point', coordinates: [-122.4394, 37.7949], address: '789 Air Blvd' }
    });

    console.log('👷 Technicians seeded...');

    // Create some bookings
    await Booking.create([
      {
        user: customer._id,
        technician: tech1._id,
        service: 'Pipe Leak Repair',
        status: 'pending',
        price: 60,
        address: '789 Customer Ln',
        scheduledDate: new Date(Date.now() + 86400000), // tomorrow
        notes: 'Small leak in the kitchen sink'
      },
      {
        user: customer._id,
        technician: tech2._id,
        service: 'A/C Maintenance',
        status: 'completed',
        price: 150,
        address: '789 Customer Ln',
        scheduledDate: new Date(Date.now() - 86400000 * 2), // 2 days ago
        notes: 'Regular checkup'
      }
    ]);

    console.log('📅 Bookings seeded...');
    console.log('✅ All data seeded successfully!');
    process.exit();
  } catch (err) {
    console.error('❌ Error seeding data:', err);
    process.exit(1);
  }
};

seedData();
