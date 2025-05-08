const db = require('../db/db'); // Knex instance

// GET /api/categories - Get all categories for the authenticated user's restaurant
exports.getCategories = async (req, res) => {
    const userId = req.user.id; // From authMiddleware
    console.log(`[Category Controller] Get categories request for user ID: ${userId}`);

    try {
        // Find the restaurant owned by the user
        const restaurant = await db('restaurants').where({ user_id: userId }).first();
        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant profile not found.' });
        }

        // Fetch categories for that restaurant
        const categories = await db('categories')
            .where({ restaurant_id: restaurant.id })
            .orderBy('name'); // Or order by creation time/custom order

        console.log(`[Category Controller] Found ${categories.length} categories for restaurant ID: ${restaurant.id}`);
        res.json({ categories });

    } catch (error) {
        console.error(`[Category Controller] Error fetching categories for user ID ${userId}:`, error);
        res.status(500).json({ message: 'Error fetching categories', error: error.message });
    }
};

// POST /api/categories - Create a new category
exports.createCategory = async (req, res) => {
    const userId = req.user.id;
    // Destructure all potential language fields + image_path
    const { name, name_en, name_tr, description, description_en, description_tr, image_path } = req.body;

    // Primary name (default language) is still required
    const trimmedName = name ? name.trim() : '';
    if (!trimmedName) {
        return res.status(400).json({ message: 'Default category name cannot be empty' });
    }

    console.log(`[Category Controller] Create category request for user ID: ${userId} with default name: ${trimmedName}`);

    try {
        // Find the restaurant owned by the user
        const restaurant = await db('restaurants').where({ user_id: userId }).first();
        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant profile not found.' });
        }

        // Check if category name already exists for this restaurant (using unique constraint)
        // Handled by DB unique constraint, but could check here first for better error message

        // Create the new category with all language fields
        await db('categories').insert({
            restaurant_id: restaurant.id,
            name: trimmedName, // Default/primary name
            name_en: name_en ? name_en.trim() : null,
            description_en: description_en ? description_en.trim() : null,
            name_tr: name_tr ? name_tr.trim() : null,
            description_tr: description_tr ? description_tr.trim() : null,
            image_path: image_path || null // Add image_path (will be null for now)
            // Add other languages here
        });

        // Fetch the category we just inserted by default name and restaurant_id
        // This assumes names are unique per restaurant (enforced by DB constraint)
        const newCategory = await db('categories')
            .where({
                restaurant_id: restaurant.id,
                name: trimmedName
            })
            .orderBy('created_at', 'desc') // Get the most recent one in case of unlikely race condition
            .first();

        if (!newCategory) {
             console.error(`[Category Controller] Failed to fetch newly created category with name: ${trimmedName} for restaurant ${restaurant.id}`);
             throw new Error('Failed to retrieve created category');
        }

        console.log(`[Category Controller] Category created successfully: ID ${newCategory.id} for restaurant ID ${restaurant.id}`);
        res.status(201).json({ message: 'Category created successfully', category: newCategory }); // Send the fetched category

    } catch (error) {
        // Handle potential unique constraint violation
        if (error.code === 'ER_DUP_ENTRY' || error.message.includes('UNIQUE constraint failed')) {
             console.warn(`[Category Controller] Duplicate category name attempt for restaurant ID ${restaurant?.id}: ${name}`);
             return res.status(409).json({ message: 'Category name already exists for this restaurant.' }); // 409 Conflict
        }
        console.error(`[Category Controller] Error creating category for user ID ${userId}:`, error);
        res.status(500).json({ message: 'Error creating category', error: error.message });
    }
};

// PUT /api/categories/:categoryId - Update a category
exports.updateCategory = async (req, res) => {
    const userId = req.user.id;
    const { categoryId } = req.params;
    // Destructure all potential language fields for update + image_path
    const { name, name_en, name_tr, description, description_en, description_tr, image_path } = req.body;

    // Primary name (default language) is still required if being updated
    const trimmedName = name ? name.trim() : undefined; // Allow not sending it if not updating
    if (name !== undefined && !trimmedName) { // if name was sent but is empty after trim
        return res.status(400).json({ message: 'Default category name cannot be empty if provided for update' });
    }

    console.log(`[Category Controller] Update category request for ID: ${categoryId} by user ID: ${userId}`);

    try {
        // Verify user owns the restaurant associated with this category
        const category = await db('categories')
            .select('categories.id', 'restaurants.user_id')
            .innerJoin('restaurants', 'categories.restaurant_id', 'restaurants.id')
            .where('categories.id', categoryId)
            .first();

        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        if (category.user_id !== userId) {
            console.warn(`[Category Controller] Unauthorized attempt to update category ID: ${categoryId} by user ID: ${userId}`);
            return res.status(403).json({ message: 'Forbidden: You do not own this category' });
        }

        // Perform update
        const updateData = { updated_at: db.fn.now() };
        if (trimmedName) updateData.name = trimmedName;
        if (description !== undefined) updateData.description = description; // Allow setting to null/empty
        if (name_en !== undefined) updateData.name_en = name_en ? name_en.trim() : null;
        if (description_en !== undefined) updateData.description_en = description_en ? description_en.trim() : null;
        if (name_tr !== undefined) updateData.name_tr = name_tr ? name_tr.trim() : null;
        if (description_tr !== undefined) updateData.description_tr = description_tr ? description_tr.trim() : null;
        if (image_path !== undefined) updateData.image_path = image_path; // Add image_path update
        // Add other languages here

        if (Object.keys(updateData).length <= 1) { // Only updated_at or no fields means no actual data change
            return res.status(400).json({ message: 'No new data provided for update.' });
        }

        const updatedCount = await db('categories')
            .where({ id: categoryId })
            .update(updateData);

        if (updatedCount === 0) {
            // Should not happen if previous check passed
            return res.status(404).json({ message: 'Category not found during update' });
        }

        // Fetch the updated category
        const updatedCategory = await db('categories').where({ id: categoryId }).first();

        console.log(`[Category Controller] Category updated successfully: ID ${categoryId}`);
        res.json({ message: 'Category updated successfully', category: updatedCategory });

    } catch (error) {
         // Handle potential unique constraint violation
        if (error.code === 'ER_DUP_ENTRY' || error.message.includes('UNIQUE constraint failed')) {
             console.warn(`[Category Controller] Duplicate category name attempt during update for ID: ${categoryId}`);
             return res.status(409).json({ message: 'Another category with this name already exists.' }); // 409 Conflict
        }
        console.error(`[Category Controller] Error updating category ID ${categoryId}:`, error);
        res.status(500).json({ message: 'Error updating category', error: error.message });
    }
};

// DELETE /api/categories/:categoryId - Delete a category
exports.deleteCategory = async (req, res) => {
    const userId = req.user.id;
    const { categoryId } = req.params;

    console.log(`[Category Controller] Delete category request for ID: ${categoryId} by user ID: ${userId}`);

    try {
        // Verify user owns the restaurant associated with this category
        const category = await db('categories')
            .select('categories.id', 'restaurants.user_id')
            .innerJoin('restaurants', 'categories.restaurant_id', 'restaurants.id')
            .where('categories.id', categoryId)
            .first();

        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        if (category.user_id !== userId) {
            console.warn(`[Category Controller] Unauthorized attempt to delete category ID: ${categoryId} by user ID: ${userId}`);
            return res.status(403).json({ message: 'Forbidden: You do not own this category' });
        }

        // Perform delete
        // Note: The migration sets menu_items.category_id to NULL on delete.
        // If you wanted to prevent deletion if items exist, add a check here.
        const deletedCount = await db('categories').where({ id: categoryId }).del();

        if (deletedCount === 0) {
            // Should not happen
            return res.status(404).json({ message: 'Category not found during delete' });
        }

        console.log(`[Category Controller] Category deleted successfully: ID ${categoryId}`);
        res.status(200).json({ message: 'Category deleted successfully', categoryId }); // 200 OK or 204 No Content

    } catch (error) {
        console.error(`[Category Controller] Error deleting category ID ${categoryId}:`, error);
        res.status(500).json({ message: 'Error deleting category', error: error.message });
    }
};
