const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Product = require('../models/product');
const auth = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `product-${uniqueSuffix}${ext}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        // Accept only images
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    }
});

// Get all products by category
router.get('/category/:categoryId', auth, async (req, res) => {
    try {
        const { categoryId } = req.params;
        const products = await Product.getAllByCategory(categoryId, req.user.restaurant_id);
        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

// Create a new product
router.post('/', auth, upload.single('image'), async (req, res) => {
    try {
        const { name, description, price, category_id } = req.body;
        
        const productData = {
            restaurant_id: req.user.restaurant_id,
            category_id,
            name,
            description,
            price: parseFloat(price),
            image_path: req.file ? req.file.filename : null
        };
        
        const product = await Product.create(productData);
        res.status(201).json(product);
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ error: 'Failed to create product' });
    }
});

// Update a product
router.put('/:id', auth, upload.single('image'), async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, category_id } = req.body;
        
        // Check if product exists and belongs to this restaurant
        const existingProduct = await Product.getById(id, req.user.restaurant_id);
        if (!existingProduct) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        const productData = {
            restaurant_id: req.user.restaurant_id,
            category_id,
            name,
            description,
            price: parseFloat(price)
        };
        
        if (req.file) {
            // Delete old image if exists
            if (existingProduct.image_path) {
                const oldImagePath = path.join(__dirname, '../uploads', existingProduct.image_path);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
            
            productData.image_path = req.file.filename;
        }
        
        const updatedProduct = await Product.update(id, productData);
        res.json(updatedProduct);
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ error: 'Failed to update product' });
    }
});

// Delete a product
router.delete('/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if product exists and belongs to this restaurant
        const existingProduct = await Product.getById(id, req.user.restaurant_id);
        if (!existingProduct) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        // Delete image if exists
        if (existingProduct.image_path) {
            const imagePath = path.join(__dirname, '../uploads', existingProduct.image_path);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }
        
        await Product.delete(id, req.user.restaurant_id);
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ error: 'Failed to delete product' });
    }
});

// Update product order
router.put('/order/update', auth, async (req, res) => {
    try {
        const { products } = req.body;
        await Product.updateOrder(products);
        res.json({ message: 'Product order updated successfully' });
    } catch (error) {
        console.error('Error updating product order:', error);
        res.status(500).json({ error: 'Failed to update product order' });
    }
});

// Update product availability
router.put('/:id/availability', auth, async (req, res) => {
    try {
        const { isAvailable } = req.body;
        await Product.updateAvailability(req.params.id, req.user.id, isAvailable);
        res.json({ message: 'Product availability updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update product availability' });
    }
});

module.exports = router;
