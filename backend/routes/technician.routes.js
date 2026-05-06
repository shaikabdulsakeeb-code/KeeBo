const express = require('express');
const router = express.Router();
const {
  createProfile,
  updateProfile,
  getOwnProfile,
  getApprovedTechnicians,
} = require('../controllers/technician.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const upload = require('../middleware/upload.middleware');

const uploadFields = upload.fields([
  { name: 'profileImage', maxCount: 1 },
  { name: 'workImages', maxCount: 5 },
]);

router.route('/')
  .get(getApprovedTechnicians);

router.route('/profile')
  .post(protect, authorize('technician'), uploadFields, createProfile)
  .put(protect, authorize('technician'), uploadFields, updateProfile)
  .get(protect, authorize('technician'), getOwnProfile);

module.exports = router;
