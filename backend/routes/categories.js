const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const authMiddleware = require('../middleware/authMiddleware');

// All category routes require authentication

// GET /api/categories - Get all categories for the user's restaurant
router.get('/', authMiddleware, categoryController.getCategories);

// POST /api/categories - Create a new category
router.post('/', authMiddleware, categoryController.createCategory);

// PUT /api/categories/:categoryId - Update a specific category
router.put('/:categoryId', authMiddleware, categoryController.updateCategory);

// DELETE /api/categories/:categoryId - Delete a specific category
router.delete('/:categoryId', authMiddleware, categoryController.deleteCategory);

module.exports = router;
