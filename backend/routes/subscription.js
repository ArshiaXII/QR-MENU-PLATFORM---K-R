const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = subscriptionController.adminMiddleware; // Import admin check from controller (Assuming this exists in controller)

// GET /api/subscription/status - Get current user's restaurant subscription status
router.get('/status', authMiddleware, subscriptionController.getSubscriptionStatus); // Correct function name

// TODO: Implement admin routes and adminMiddleware later
// // POST /api/subscription/activate - Activate subscription (Admin only)
// router.post('/activate', authMiddleware, adminMiddleware, subscriptionController.activateSubscription);

// // POST /api/subscription/deactivate - Deactivate subscription (Admin only)
// router.post('/deactivate', authMiddleware, adminMiddleware, subscriptionController.deactivateSubscription);

module.exports = router;
