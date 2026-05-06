const express = require('express');
const router = express.Router();
const {
  addReview,
  getTechnicianReviews,
} = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

router.route('/reviews/:technicianId')
  .post(protect, authorize('user'), addReview)
  .get(getTechnicianReviews);

module.exports = router;
