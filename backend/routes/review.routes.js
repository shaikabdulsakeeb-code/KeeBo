const express = require('express');
const {
  addReview,
  getReviews,
  deleteReview,
} = require('../controllers/review.controller');

const router = express.Router({ mergeParams: true });

const { protect } = require('../middleware/auth.middleware');

router.route('/')
  .get(getReviews)
  .post(protect, addReview);

router.route('/:id')
  .delete(protect, deleteReview);

module.exports = router;
