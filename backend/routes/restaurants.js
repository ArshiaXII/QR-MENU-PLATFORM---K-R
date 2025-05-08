const express = require('express');
const router = express.Router();
const restaurantController = require('../controllers/restaurantController');
const authMiddleware = require('../middleware/authMiddleware');

// All restaurant profile routes require authentication

// GET /api/restaurants/me - Get the authenticated user's restaurant profile
router.get('/me', authMiddleware, restaurantController.getMyRestaurant);

// PUT /api/restaurants/me - Create or update the authenticated user's restaurant profile
router.put('/me', authMiddleware, restaurantController.upsertMyRestaurant);

// Note: We might add routes later for public restaurant info if needed, e.g., GET /api/restaurants/:slug

module.exports = router;
