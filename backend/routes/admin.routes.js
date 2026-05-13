const express = require('express');
const { 
  getStats, 
  getTechnicians, 
  verifyTechnician,
  getUsers,
  deleteUser,
  getAllBookings
} = require('../controllers/admin.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getStats);
router.get('/technicians', getTechnicians);
router.put('/technicians/:id/verify', verifyTechnician);

router.get('/users', getUsers);
router.delete('/users/:id', deleteUser);
router.get('/bookings', getAllBookings);

module.exports = router;
