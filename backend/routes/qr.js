const express = require('express');
const router = express.Router();
const qrController = require('../controllers/qrController');
// const authMiddleware = require('../middleware/authMiddleware'); // Decide if auth is needed

// GET /api/qr/generate/:restaurantId - Generate QR code for a restaurant's public menu URL
router.get('/generate/:restaurantId', qrController.generateQrCode); // No auth needed for public QR generation

module.exports = router;