const express = require('express');
const router = express.Router();

// Include other resource routers
const reviewRouter = require('./review.routes');

// Re-route into other resource routers
router.use('/:technicianId/reviews', reviewRouter);
const {
  createProfile,
  updateProfile,
  getOwnProfile,
  getApprovedTechnicians,
  getTechniciansInRadius,
  getTechnicianById,
  getServiceStats,
  payDues,
} = require('../controllers/technician.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const upload = require('../middleware/upload.middleware');

const uploadFields = upload.fields([
  { name: 'profileImage', maxCount: 1 },
  { name: 'workImages', maxCount: 5 },
  { name: 'idVerification', maxCount: 1 },
]);

router.route('/')
  .get(getApprovedTechnicians);

router.get('/radius/:lat/:lng/:distance', getTechniciansInRadius);
router.get('/stats/services', getServiceStats);

router.route('/profile')
  .post(protect, authorize('technician'), uploadFields, createProfile)
  .put(protect, authorize('technician'), uploadFields, updateProfile)
  .get(protect, authorize('technician'), getOwnProfile);

router.post('/pay-dues', protect, authorize('technician'), payDues);

router.get('/:id', getTechnicianById);

module.exports = router;
