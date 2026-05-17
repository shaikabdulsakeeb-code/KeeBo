const express = require('express');
const router = express.Router();
const { 
  getUserProfile, 
  addFavorite, 
  removeFavorite, 
  getFavorites,
  updateProfileImage
} = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

router.get('/profile', protect, getUserProfile);
router.put('/profile/image', protect, upload.single('profileImage'), updateProfileImage);
router.get('/favorites', protect, getFavorites);
router.post('/favorites/:technicianId', protect, addFavorite);
router.delete('/favorites/:technicianId', protect, removeFavorite);

module.exports = router;
