const express = require('express');
const { 
  getStats, 
  getTechnicians, 
  getAdminTechnicianById,
  verifyTechnician,
  deleteTechnician,
  getUsers,
  deleteUser,
  getAllBookings,
  updateAdminBookingStatus,
  deleteBooking,
  getSettings,
  updateSettings,
  getSettlements,
  verifySettlement,
  toggleSuspendTechnician,
  getAllReviews,
  adminDeleteReview
} = require('../controllers/admin.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getStats);
router.get('/technicians', getTechnicians);
router.get('/technicians/:id', getAdminTechnicianById);
router.put('/technicians/:id/verify', verifyTechnician);
router.put('/technicians/:id/suspend', toggleSuspendTechnician);
router.delete('/technicians/:id', deleteTechnician);

router.get('/users', getUsers);
router.delete('/users/:id', deleteUser);
router.get('/bookings', getAllBookings);
router.put('/bookings/:id/status', updateAdminBookingStatus);
router.delete('/bookings/:id', deleteBooking);

router.get('/settings', getSettings);
router.put('/settings', updateSettings);

router.get('/settlements', getSettlements);
router.put('/settlements/:id', verifySettlement);

router.get('/reviews', getAllReviews);
router.delete('/reviews/:id', adminDeleteReview);

module.exports = router;
