const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const authMiddleware = require('../middleware/authMiddleware');

// --- Publicly Accessible Logging Endpoints ---
// POST /api/analytics/log-visit - Log a visit to a public menu
// Takes menuId (or restaurantId/slug to find menuId) in body
router.post('/log-visit', analyticsController.logMenuVisit);

// POST /api/analytics/log-item-view - Log a view of a specific menu item
// Takes itemId and visitId (from log-visit response or client-side generation) in body
router.post('/log-item-view', analyticsController.logItemView);


// --- Protected Analytics Data Endpoints ---
// GET /api/analytics/summary - Get analytics summary for the authenticated user's restaurant
router.get('/summary', authMiddleware, analyticsController.getAnalyticsSummary);

// Example: Get detailed views for a specific menu (can be expanded)
// router.get('/menu-views/:menuId', authMiddleware, analyticsController.getDetailedMenuViews);

// Example: Get detailed views for a specific item (can be expanded)
// router.get('/item-views/:itemId', authMiddleware, analyticsController.getDetailedItemViews);


module.exports = router;
