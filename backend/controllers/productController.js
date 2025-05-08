const Product = require('../models/product');
const Category = require('../models/category'); // Needed to verify category ownership
const fs = require('fs');
const path = require('path');

// Utility function to handle required user check
const ensureUser = (req, res) => {
    if (!req.user) {
        res.status(401).json({ message: 'Authentication required for this action.' });
        return false;
    }
    return true;
};

// Helper to delete image file
const deleteImageFile = (imagePath) => {
    if (imagePath) {
        const fullPath = path.join(__dirname, '..', imagePath); // Assumes imagePath is relative like 'uploads/image.jpg'
        fs.unlink(fullPath, (err) => {
            if (err) {
                // Log error but don't block response (e.g., file already deleted)
                console.error(`Error deleting image file ${fullPath}:`, err);
            }
        });
    }
}

// POST /api/products
exports.createProduct = (req, res) => {
    if (!ensureUser(req, res)) {
        // If auth failed and an image was uploaded, delete it
        if (req.file) deleteImageFile(req.file.path.replace(__dirname + '\\..\\' , '').replace(/\\/g, '/')); // Adjust path for deletion
        return;
    }

    const { category_id, name, description, price } = req.body;
    const userId = req.user.id;
    const imageFile = req.file; // From multer upload.single('image')

    // --- Input Validation ---
    if (!category_id || !name || name.trim() === '' || price === undefined) {
        if (imageFile) deleteImageFile(imageFile.path.replace(__dirname + '\\..\\' , '').replace(/\\/g, '/'));
        return res.status(400).json({ message: 'Category ID, Name, and Price are required' });
    }
    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
        if (imageFile) deleteImageFile(imageFile.path.replace(__dirname + '\\..\\' , '').replace(/\\/g, '/'));
        return res.status(400).json({ message: 'Invalid price format' });
    }
    const parsedCategoryId = parseInt(category_id, 10);
    if (isNaN(parsedCategoryId)) {
        if (imageFile) deleteImageFile(imageFile.path.replace(__dirname + '\\..\\' , '').replace(/\\/g, '/'));
        return res.status(400).json({ message: 'Invalid category ID format' });
    }
    // --- End Validation ---

    // Verify category belongs to the user
    Category.findByIdAndUserId(parsedCategoryId, userId, (err, category) => {
        if (err || !category) {
            if (imageFile) deleteImageFile(imageFile.path.replace(__dirname + '\\..\\' , '').replace(/\\/g, '/'));
            return res.status(404).json({ message: 'Category not found or does not belong to the user' });
        }

        // Prepare product data
        const productData = {
            category_id: parsedCategoryId,
            user_id: userId,
            name: name.trim(),
            description: description ? description.trim() : null,
            price: parsedPrice,
            // Store relative path like 'uploads/image-123.jpg'
            image_path: imageFile ? imageFile.path.replace(__dirname + '\\..\\' , '').replace(/\\/g, '/') : null
            // image_path: imageFile ? path.join('uploads', imageFile.filename) : null
        };

        Product.create(productData, (err, newProduct) => {
            if (err) {
                console.error("Error creating product:", err);
                // If DB insert fails, delete uploaded image
                if (imageFile) deleteImageFile(productData.image_path);
                return res.status(500).json({ message: 'Error creating product' });
            }
            res.status(201).json({ message: 'Product created successfully', product: { ...productData, id: newProduct.id } });
        });
    });
};

// GET /api/products (?category_id=...)
exports.getProducts = (req, res) => {
    if (!ensureUser(req, res)) return;
    const userId = req.user.id;
    const { category_id } = req.query;
    const categoryId = category_id ? parseInt(category_id, 10) : null;

    if (category_id && isNaN(categoryId)) {
        return res.status(400).json({ message: 'Invalid category ID format in query parameter' });
    }

    Product.findByUserId(userId, categoryId, (err, products) => {
        if (err) {
            console.error("Error fetching products:", err);
            return res.status(500).json({ message: 'Error fetching products' });
        }
         // Add full URL for image paths before sending response
         const productsWithUrls = products.map(p => ({
            ...p,
            image_url: p.image_path ? `${process.env.SERVER_BASE_URL}/${p.image_path}` : null
         }));
        res.status(200).json(productsWithUrls);
    });
};

// PUT /api/products/:id
exports.updateProduct = (req, res) => {
    if (!ensureUser(req, res)) {
        if (req.file) deleteImageFile(req.file.path.replace(__dirname + '\\..\\' , '').replace(/\\/g, '/'));
        return;
    }

    const productId = parseInt(req.params.id, 10);
    const userId = req.user.id;
    const { category_id, name, description, price } = req.body;
    const imageFile = req.file; // New image, if uploaded

    if (isNaN(productId)) {
        if (imageFile) deleteImageFile(imageFile.path.replace(__dirname + '\\..\\' , '').replace(/\\/g, '/'));
        return res.status(400).json({ message: 'Invalid product ID' });
    }

    // --- Input Validation ---
    const updateData = {};
    if (name !== undefined) {
        if (name.trim() === '') { if (imageFile) deleteImageFile(imageFile.path.replace(__dirname + '\\..\\' , '').replace(/\\/g, '/')); return res.status(400).json({ message: 'Product name cannot be empty' }); }
        updateData.name = name.trim();
    }
    if (description !== undefined) { updateData.description = description ? description.trim() : null; }
    if (price !== undefined) {
        const parsedPrice = parseFloat(price);
        if (isNaN(parsedPrice) || parsedPrice < 0) { if (imageFile) deleteImageFile(imageFile.path.replace(__dirname + '\\..\\' , '').replace(/\\/g, '/')); return res.status(400).json({ message: 'Invalid price format' }); }
        updateData.price = parsedPrice;
    }
    if (category_id !== undefined) {
        const parsedCategoryId = parseInt(category_id, 10);
        if (isNaN(parsedCategoryId)) { if (imageFile) deleteImageFile(imageFile.path.replace(__dirname + '\\..\\' , '').replace(/\\/g, '/')); return res.status(400).json({ message: 'Invalid category ID format' }); }
        updateData.category_id = parsedCategoryId;
    }
     if (imageFile) {
        updateData.image_path = imageFile.path.replace(__dirname + '\\..\\' , '').replace(/\\/g, '/');
    }
    if (Object.keys(updateData).length === 0) {
         // No fields to update, this could be valid if only image was sent, handled above
        if (!imageFile) {
             return res.status(400).json({ message: 'No fields provided for update' });
        }
    }
   // --- End Validation ---

    // Async function to handle the logic
    const performUpdate = async () => {
        try {
            // 1. Get current product data (to check ownership and get old image path)
            let currentProduct;
            await new Promise((resolve, reject) => {
                Product.findByIdAndUserId(productId, userId, (err, product) => {
                    if (err) return reject(new Error('Error finding product'));
                    if (!product) return reject(new Error('Product not found or unauthorized'));
                    currentProduct = product;
                    resolve();
                });
            });

            // 2. If category is being changed, verify the new category belongs to the user
            if (updateData.category_id && updateData.category_id !== currentProduct.category_id) {
                 await new Promise((resolve, reject) => {
                    Category.findByIdAndUserId(updateData.category_id, userId, (err, category) => {
                        if (err || !category) return reject(new Error('New category not found or unauthorized'));
                        resolve();
                    });
                 });
            }

            // 3. Perform the update in the DB
            await new Promise((resolve, reject) => {
                Product.update(productId, userId, updateData, (err, result) => {
                    if (err) return reject(new Error('Error updating product in DB'));
                    if (result.changes === 0) return reject(new Error('Update failed, product not found or unauthorized')); // Should be caught earlier, but safety check
                    resolve();
                });
            });

            // 4. If update successful and a new image was uploaded, delete the old image
            if (imageFile && currentProduct.image_path) {
                deleteImageFile(currentProduct.image_path);
            }

            // 5. Send success response
            res.status(200).json({ message: 'Product updated successfully', product: { ...currentProduct, ...updateData } });

        } catch (error) {
             // If any step failed and a new image was uploaded, delete the new image
             if (imageFile) {
                 deleteImageFile(updateData.image_path);
             }
            console.error("Error during product update process:", error);
            if (error.message.includes('not found or unauthorized')) {
                res.status(404).json({ message: error.message });
            } else if (error.message.includes('category not found or unauthorized')) {
                 res.status(400).json({ message: error.message });
            } else {
                res.status(500).json({ message: 'Error updating product' });
            }
        }
    };

    performUpdate();
};


// DELETE /api/products/:id
exports.deleteProduct = (req, res) => {
    if (!ensureUser(req, res)) return;

    const productId = parseInt(req.params.id, 10);
    const userId = req.user.id;

    if (isNaN(productId)) {
        return res.status(400).json({ message: 'Invalid product ID' });
    }

    // 1. Find the product to get the image path before deleting from DB
    Product.findByIdAndUserId(productId, userId, (err, product) => {
        if (err) {
            console.error("Error finding product before delete:", err);
            return res.status(500).json({ message: 'Error finding product before deletion' });
        }
        if (!product) {
            return res.status(404).json({ message: 'Product not found or you do not have permission to delete it' });
        }

        const imagePathToDelete = product.image_path;

        // 2. Delete the product from the database
        Product.delete(productId, userId, (err, result) => {
            if (err) {
                console.error("Error deleting product:", err);
                return res.status(500).json({ message: 'Error deleting product' });
            }
            if (result.changes === 0) {
                // Should have been caught by the find check, but for safety
                return res.status(404).json({ message: 'Product not found or deletion failed unexpectedly' });
            }

            // 3. If DB deletion successful, delete the associated image file
            if (imagePathToDelete) {
                deleteImageFile(imagePathToDelete);
            }

            res.status(200).json({ message: 'Product deleted successfully' });
        });
    });
};
