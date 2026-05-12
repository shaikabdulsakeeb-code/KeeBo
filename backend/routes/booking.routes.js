const express = require('express');
const {
  createBooking,
  getBookings,
  updateStatus,
} = require('../controllers/booking.controller');

const router = express.Router();

const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.route('/')
  .post(createBooking)
  .get(getBookings);

router.route('/:id/status')
  .put(updateStatus);

module.exports = router;
