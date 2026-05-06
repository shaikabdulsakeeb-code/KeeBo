const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  deleteUser,
  getAllTechniciansAdmin,
  updateTechnicianStatus,
} = require('../controllers/admin.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

// Apply middleware to all routes in this file
router.use(protect);
router.use(authorize('admin'));

router.route('/users')
  .get(getAllUsers);

router.route('/users/:id')
  .delete(deleteUser);

router.route('/technicians')
  .get(getAllTechniciansAdmin);

router.route('/technicians/:id/status')
  .put(updateTechnicianStatus);

module.exports = router;
