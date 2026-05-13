const express = require('express');
const router = express.Router();
const { 
  getUserProfile, 
  addFavorite, 
  removeFavorite, 
  getFavorites 
} = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');

router.route('/profile').get(protect, getUserProfile);

router.route('/favorites')
  .get(protect, getFavorites);

router.route('/favorites/:technicianId')
  .post(protect, addFavorite)
  .delete(protect, removeFavorite);

module.exports = router;
