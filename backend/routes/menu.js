const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');
const authMiddleware = require('../middleware/authMiddleware');

// --- Menu Routes ---

// POST /api/menu/create-menu - Create a new menu for the authenticated user's restaurant
router.post('/create-menu', authMiddleware, menuController.createMenu);

// GET /api/menu/get-menu/:restaurantId - Get public menu details for a specific restaurant
// Note: This might fetch the 'primary' or first menu for the restaurant, or list all public menus.
// The exact logic depends on how menus are presented publicly.
// For now, assumes fetching a specific menu, maybe needs adjustment later.
// Let's make this public for now.
// router.get('/get-menu/:restaurantId', menuController.getMenu); // Keep internal one if needed, but create specific public one
router.get('/public/:restaurantSlug', menuController.getPublicMenuBySlug); // New public endpoint by slug

// PUT /api/menu/edit-menu/:menuId - Edit details of a specific menu
router.put('/edit-menu/:menuId', authMiddleware, menuController.editMenu);

// DELETE /api/menu/delete-menu/:menuId - Delete a specific menu
router.delete('/delete-menu/:menuId', authMiddleware, menuController.deleteMenu);


// --- Menu Item Routes (Nested under a specific menu) ---

// GET /api/menu/:menuId/items - Get all items for a specific menu
router.get('/:menuId/items', authMiddleware, menuController.getMenuItems); // Add this route

// POST /api/menu/:menuId/items - Add a new item to a specific menu
router.post('/:menuId/items', authMiddleware, menuController.addMenuItem);

// PUT /api/menu/:menuId/items/:itemId - Edit a specific item within a menu
router.put('/:menuId/items/:itemId', authMiddleware, menuController.editMenuItem);

// DELETE /api/menu/:menuId/items/:itemId - Delete a specific item from a menu
router.delete('/:menuId/items/:itemId', authMiddleware, menuController.deleteMenuItem);


module.exports = router;
