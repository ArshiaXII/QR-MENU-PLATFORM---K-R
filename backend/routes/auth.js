const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware'); // Import the middleware

// POST /api/auth/register - Register a new user
router.post('/register', authController.register);

// POST /api/auth/login - Login a user
router.post('/login', authController.login);

// GET /api/auth/me - Get current authenticated user's details
// Apply the authMiddleware to protect this route
router.get('/me', authMiddleware, authController.getMe);

module.exports = router;
