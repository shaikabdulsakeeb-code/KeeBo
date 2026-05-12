const express = require('express');
const router = express.Router();
const {
  addReview,
  getTechnicianReviews,
  getUserProfile,
} = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

router.route('/profile').get(protect, getUserProfile);

router.route('/reviews/:technicianId')
  .post(protect, authorize('user'), addReview)
  .get(getTechnicianReviews);

module.exports = router;
