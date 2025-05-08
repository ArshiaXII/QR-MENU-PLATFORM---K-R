const db = require('../db/db'); // Knex instance

const { v4: uuidv4 } = require('uuid'); // For generating unique IDs if needed, though DB auto-increment is used

// Placeholder functions for menu operations

// POST /api/menu/create-menu (Requires auth)
exports.createMenu = async (req, res) => {
    const userId = req.user.id; // From authMiddleware
    const { name, description, template_id } = req.body;

    if (!name) {
        return res.status(400).json({ message: 'Menu name is required' });
    }

    console.log(`[Menu Controller] Create menu request for user ID: ${userId}`);

    // DB Logic (pending connection fix) - Uncommented
    try {
        // 1. Find the restaurant owned by the user
        const restaurant = await db('restaurants').where({ user_id: userId }).first();
        if (!restaurant) {
            console.log(`[Menu Controller] No restaurant found for user ID: ${userId} when creating menu.`);
            // Option 1: Error out - User needs to create restaurant profile first
            return res.status(404).json({ message: 'Restaurant profile not found. Please create one first.' });
            // Option 2: Create a default restaurant? (Less ideal for this structure)
        }

        // 2. Create the new menu associated with the restaurant
        const [newMenu] = await db('menus').insert({
            restaurant_id: restaurant.id,
            name,
            description: description || null, // Allow null description
            template_id: template_id || 'default' // Use default template if not provided
        }).returning('*'); // Return the created menu object

        console.log(`[Menu Controller] Menu created successfully: ID ${newMenu.id} for restaurant ID ${restaurant.id}`);
        res.status(201).json({ message: 'Menu created successfully', menu: newMenu });

    } catch (error) {
        console.error(`[Menu Controller] Error creating menu for user ID ${userId}:`, error);
        res.status(500).json({ message: 'Error creating menu', error: error.message });
    }
    // */ // End of uncommented block

    // // Placeholder response - Commented out
    // res.status(503).json({ message: 'Menu creation pending database connection fix', userId, name });
};

// GET /api/menu/get-menu/:restaurantId (Public endpoint)
exports.getMenu = async (req, res) => {
    const { restaurantId } = req.params;
    console.log(`[Menu Controller] Get menu request for restaurant ID: ${restaurantId}`);

    // DB Logic (pending connection fix) - Uncommented
    try {
        // 1. Find the restaurant (optional, maybe just fetch menus directly)
        // const restaurant = await db('restaurants').where({ id: restaurantId }).first();
        // if (!restaurant) {
        //     return res.status(404).json({ message: 'Restaurant not found' });
        // }

        // 2. Find the menu(s) for the restaurant. Assuming one primary menu for now.
        const menu = await db('menus').where({ restaurant_id: restaurantId }).first(); // Adjust if multiple menus allowed
        if (!menu) {
            return res.status(404).json({ message: 'Menu not found for this restaurant' });
        }

        // 3. Find categories for the restaurant associated with this menu
        const categories = await db('categories')
            .where({ restaurant_id: menu.restaurant_id })
            .orderBy('name'); // Or a custom order field

        // 4. Find menu items for this menu, potentially grouped by category
        const menuItems = await db('menu_items')
            .where({ menu_id: menu.id })
            .orderBy('category_id') // Group by category first
            .orderBy('name'); // Then by name within category

        // Optional: Structure the response to group items under categories
        const categoriesWithItems = categories.map(category => ({
            ...category,
            items: menuItems.filter(item => item.category_id === category.id)
        }));
        // Include items without a category
        const uncategorizedItems = menuItems.filter(item => item.category_id === null);


        console.log(`[Menu Controller] Menu, categories, and items fetched for restaurant ID: ${restaurantId}`);
        res.json({
            menu: {
                ...menu,
                // Return items grouped by category and uncategorized items separately
                categories: categoriesWithItems,
                uncategorizedItems: uncategorizedItems,
                // Or alternatively, just return flat lists and let frontend group:
                // allCategories: categories,
                // allItems: menuItems
            }
        });

    } catch (error) {
        console.error(`[Menu Controller] Error fetching menu for restaurant ID ${restaurantId}:`, error);
        res.status(500).json({ message: 'Error fetching menu', error: error.message });
    }
    // */ // End of uncommented block

    // // Placeholder response - Commented out
    // res.status(503).json({ message: 'Get menu pending database connection fix', restaurantId });
};

// PUT /api/menu/edit-menu/:menuId (Requires auth)
exports.editMenu = async (req, res) => {
    const { menuId } = req.params;
    const userId = req.user.id;
    const { name, description, template_id } = req.body;

    console.log(`[Menu Controller] Edit menu request for menu ID: ${menuId} by user ID: ${userId}`);

    if (!name && !description && !template_id) {
        return res.status(400).json({ message: 'No update data provided' });
    }

    // DB Logic (pending connection fix) - Uncommented
    try {
        // 1. Verify user owns the restaurant associated with this menu
        const menu = await db('menus')
            .select('menus.id', 'restaurants.user_id')
            .innerJoin('restaurants', 'menus.restaurant_id', 'restaurants.id')
            .where('menus.id', menuId)
            .first();

        if (!menu) {
            return res.status(404).json({ message: 'Menu not found' });
        }
        if (menu.user_id !== userId) {
            console.warn(`[Menu Controller] Unauthorized attempt to edit menu ID: ${menuId} by user ID: ${userId}`);
            return res.status(403).json({ message: 'Forbidden: You do not own this menu' });
        }

        // 2. Prepare update data
        const updateData = {};
        if (name) updateData.name = name;
        if (description !== undefined) updateData.description = description; // Allow setting null/empty
        if (template_id) updateData.template_id = template_id;
        updateData.updated_at = db.fn.now();

        // 3. Perform update
        const updatedCount = await db('menus').where({ id: menuId }).update(updateData);

        if (updatedCount === 0) {
            // Should not happen if previous check passed, but good practice
            return res.status(404).json({ message: 'Menu not found during update' });
        }

        // 4. Fetch the updated menu to return it
        const updatedMenu = await db('menus').where({ id: menuId }).first();

        console.log(`[Menu Controller] Menu updated successfully: ID ${menuId}`);
        res.json({ message: 'Menu updated successfully', menu: updatedMenu });

    } catch (error) {
        console.error(`[Menu Controller] Error updating menu ID ${menuId}:`, error);
        res.status(500).json({ message: 'Error updating menu', error: error.message });
    }
    // */ // End of uncommented block

    // // Placeholder response - Commented out
    // res.status(503).json({ message: 'Edit menu pending database connection fix', menuId, userId, updateData: req.body });
};

// DELETE /api/menu/delete-menu/:menuId (Requires auth)
exports.deleteMenu = async (req, res) => {
    const { menuId } = req.params;
    const userId = req.user.id;

    console.log(`[Menu Controller] Delete menu request for menu ID: ${menuId} by user ID: ${userId}`);

    // DB Logic (pending connection fix) - Uncommented
    try {
        // 1. Verify user owns the restaurant associated with this menu
        const menu = await db('menus')
            .select('menus.id', 'restaurants.user_id')
            .innerJoin('restaurants', 'menus.restaurant_id', 'restaurants.id')
            .where('menus.id', menuId)
            .first();

        if (!menu) {
            return res.status(404).json({ message: 'Menu not found' });
        }
        if (menu.user_id !== userId) {
             console.warn(`[Menu Controller] Unauthorized attempt to delete menu ID: ${menuId} by user ID: ${userId}`);
            return res.status(403).json({ message: 'Forbidden: You do not own this menu' });
        }

        // 2. Perform delete (associated menu items should cascade delete due to FK constraint)
        const deletedCount = await db('menus').where({ id: menuId }).del();

        if (deletedCount === 0) {
            // Should not happen if previous check passed
            return res.status(404).json({ message: 'Menu not found during delete' });
        }

        console.log(`[Menu Controller] Menu deleted successfully: ID ${menuId}`);
        res.status(200).json({ message: 'Menu deleted successfully', menuId }); // Use 200 OK or 204 No Content

    } catch (error) {
        console.error(`[Menu Controller] Error deleting menu ID ${menuId}:`, error);
        res.status(500).json({ message: 'Error deleting menu', error: error.message });
    }
    // */ // End of uncommented block

    // // Placeholder response - Commented out
    // res.status(503).json({ message: 'Delete menu pending database connection fix', menuId, userId });
};

// --- Menu Item Operations ---

// POST /api/menu/:menuId/items (Requires auth)
exports.addMenuItem = async (req, res) => {
    const { menuId } = req.params;
    const userId = req.user.id;
    const { 
        name, description, price, image_path, category_id, is_available, // Add is_available
        name_en, description_en, name_tr, description_tr 
    } = req.body;

    const trimmedName = name ? name.trim() : '';
    if (!trimmedName || price === undefined) {
        return res.status(400).json({ message: 'Default menu item name and price are required' });
    }
    if (isNaN(parseFloat(price)) || !isFinite(price) || price < 0) {
        return res.status(400).json({ message: 'Invalid price provided' });
    }

    console.log(`[Menu Controller] Add menu item request for menu ID: ${menuId} by user ID: ${userId}`);

    // DB Logic (pending connection fix) - Uncommented
    try {
        // 1. Verify user owns the restaurant associated with this menu
        const menu = await db('menus')
            .select('menus.id', 'restaurants.user_id')
            .innerJoin('restaurants', 'menus.restaurant_id', 'restaurants.id')
            .where('menus.id', menuId)
            .first();

        if (!menu) {
            return res.status(404).json({ message: 'Menu not found' });
        }
        if (menu.user_id !== userId) {
            console.warn(`[Menu Controller] Unauthorized attempt to add item to menu ID: ${menuId} by user ID: ${userId}`);
            return res.status(403).json({ message: 'Forbidden: You do not own this menu' });
        }

        // 2. Create the new menu item
        const itemData = {
            menu_id: menuId,
            category_id: category_id || null,
            name: trimmedName, // Default/primary name
            description: description || null,
            price: parseFloat(price),
            image_path: image_path || null,
            name_en: name_en ? name_en.trim() : null,
            description_en: description_en ? description_en.trim() : null,
            name_tr: name_tr ? name_tr.trim() : null,
            description_tr: description_tr ? description_tr.trim() : null,
            is_available: is_available !== undefined ? !!is_available : true // Default to true if not provided
        };

        // Use write-then-read pattern as returning might not work reliably
        const [newId] = await db('menu_items').insert(itemData);
        const newItem = await db('menu_items').where({ id: newId }).first();

        console.log(`[Menu Controller] Menu item added successfully: ID ${newItem.id} to menu ID ${menuId} (Category ID: ${newItem.category_id})`);
        res.status(201).json({ message: 'Menu item added successfully', item: newItem });

    } catch (error) {
        console.error(`[Menu Controller] Error adding menu item to menu ID ${menuId}:`, error);
        res.status(500).json({ message: 'Error adding menu item', error: error.message });
    }
    // */ // End of uncommented block

    // // Placeholder response - Commented out
    // res.status(503).json({ message: 'Add menu item pending database connection fix', menuId, userId, itemData: req.body });
};

// PUT /api/menu/:menuId/items/:itemId (Requires auth)
exports.editMenuItem = async (req, res) => {
    const { menuId, itemId } = req.params;
    const userId = req.user.id;
    const { 
        name, description, price, image_path, category_id, is_available, // Add is_available
        name_en, description_en, name_tr, description_tr 
    } = req.body;

    console.log(`[Menu Controller] Edit menu item request for item ID: ${itemId} in menu ID: ${menuId} by user ID: ${userId}`);

    const trimmedName = name ? name.trim() : undefined;

    // Check if at least one field is being updated
    if (trimmedName === undefined && description === undefined && price === undefined && image_path === undefined && category_id === undefined && is_available === undefined &&
        name_en === undefined && description_en === undefined && name_tr === undefined && description_tr === undefined) {
        return res.status(400).json({ message: 'No update data provided' });
    }
    if (name !== undefined && !trimmedName) { 
        return res.status(400).json({ message: 'Default item name cannot be empty if provided for update' });
    }
    if (price !== undefined && (isNaN(parseFloat(price)) || !isFinite(price) || price < 0)) {
        return res.status(400).json({ message: 'Invalid price provided' });
    }

    // DB Logic (pending connection fix) - Uncommented
    try {
        // 1. Verify user owns the restaurant associated with this menu item
        const item = await db('menu_items')
            .select('menu_items.id', 'restaurants.user_id')
            .innerJoin('menus', 'menu_items.menu_id', 'menus.id')
            .innerJoin('restaurants', 'menus.restaurant_id', 'restaurants.id')
            .where('menu_items.id', itemId)
            .where('menu_items.menu_id', menuId) // Ensure item belongs to the specified menu
            .first();

        if (!item) {
            return res.status(404).json({ message: 'Menu item not found in this menu' });
        }
        if (item.user_id !== userId) {
            console.warn(`[Menu Controller] Unauthorized attempt to edit item ID: ${itemId} by user ID: ${userId}`);
            return res.status(403).json({ message: 'Forbidden: You do not own this menu item' });
        }

        // 2. Prepare update data
        const updateData = { updated_at: db.fn.now() };
        if (trimmedName) updateData.name = trimmedName;
        if (description !== undefined) updateData.description = description;
        if (price !== undefined) updateData.price = parseFloat(price);
        if (image_path !== undefined) updateData.image_path = image_path;
        if (category_id !== undefined) updateData.category_id = category_id;
        if (name_en !== undefined) updateData.name_en = name_en ? name_en.trim() : null;
        if (description_en !== undefined) updateData.description_en = description_en ? description_en.trim() : null;
        if (name_tr !== undefined) updateData.name_tr = name_tr ? name_tr.trim() : null;
        if (description_tr !== undefined) updateData.description_tr = description_tr ? description_tr.trim() : null;
        if (is_available !== undefined) updateData.is_available = !!is_available; // Handle boolean update
        
        // 3. Perform update
        const updatedCount = await db('menu_items').where({ id: itemId }).update(updateData);

        if (updatedCount === 0) {
            return res.status(404).json({ message: 'Menu item not found during update' });
        }

        // 4. Fetch updated item
        const updatedItem = await db('menu_items').where({ id: itemId }).first();

        console.log(`[Menu Controller] Menu item updated successfully: ID ${itemId}`);
        res.json({ message: 'Menu item updated successfully', item: updatedItem });

    } catch (error) {
        console.error(`[Menu Controller] Error updating menu item ID ${itemId}:`, error);
        res.status(500).json({ message: 'Error updating menu item', error: error.message });
    }
    // */ // End of uncommented block

    // // Placeholder response - Commented out
    // res.status(503).json({ message: 'Edit menu item pending database connection fix', menuId, itemId, userId, updateData: req.body });
};

// DELETE /api/menu/:menuId/items/:itemId (Requires auth)
exports.deleteMenuItem = async (req, res) => {
    const { menuId, itemId } = req.params;
    const userId = req.user.id;

    console.log(`[Menu Controller] Delete menu item request for item ID: ${itemId} in menu ID: ${menuId} by user ID: ${userId}`);

    // DB Logic (pending connection fix) - Uncommented
    try {
        // 1. Verify user owns the restaurant associated with this menu item
        const item = await db('menu_items')
            .select('menu_items.id', 'restaurants.user_id')
            .innerJoin('menus', 'menu_items.menu_id', 'menus.id')
            .innerJoin('restaurants', 'menus.restaurant_id', 'restaurants.id')
            .where('menu_items.id', itemId)
            .where('menu_items.menu_id', menuId) // Ensure item belongs to the specified menu
            .first();

        if (!item) {
            return res.status(404).json({ message: 'Menu item not found in this menu' });
        }
        if (item.user_id !== userId) {
            console.warn(`[Menu Controller] Unauthorized attempt to delete item ID: ${itemId} by user ID: ${userId}`);
            return res.status(403).json({ message: 'Forbidden: You do not own this menu item' });
        }

        // 2. Perform delete
        const deletedCount = await db('menu_items').where({ id: itemId }).del();

        if (deletedCount === 0) {
            return res.status(404).json({ message: 'Menu item not found during delete' });
        }

        console.log(`[Menu Controller] Menu item deleted successfully: ID ${itemId}`);
        res.status(200).json({ message: 'Menu item deleted successfully', itemId }); // Use 200 OK or 204 No Content

    } catch (error) {
        console.error(`[Menu Controller] Error deleting menu item ID ${itemId}:`, error);
        res.status(500).json({ message: 'Error deleting menu item', error: error.message });
    }
    // */ // End of uncommented block

    // // Placeholder response - Commented out
    // res.status(503).json({ message: 'Delete menu item pending database connection fix', menuId, itemId, userId });
};

// GET /api/menu/:menuId/items (Requires auth)
exports.getMenuItems = async (req, res) => {
    const { menuId } = req.params;
    const userId = req.user.id;

    console.log(`[Menu Controller] Get items request for menu ID: ${menuId} by user ID: ${userId}`);

    try {
        // 1. Verify user owns the restaurant associated with this menu
        const menu = await db('menus')
            .select('menus.id', 'restaurants.user_id')
            .innerJoin('restaurants', 'menus.restaurant_id', 'restaurants.id')
            .where('menus.id', menuId)
            .first();

        if (!menu) {
            return res.status(404).json({ message: 'Menu not found' });
        }
        if (menu.user_id !== userId) {
            console.warn(`[Menu Controller] Unauthorized attempt to get items for menu ID: ${menuId} by user ID: ${userId}`);
            return res.status(403).json({ message: 'Forbidden: You do not own this menu' });
        }

        // 2. Fetch items for this menu
        const items = await db('menu_items')
            .where({ menu_id: menuId })
            .orderBy('category_id') // Optional: order as needed
            .orderBy('name');

        console.log(`[Menu Controller] Found ${items.length} items for menu ID: ${menuId}`);
        res.json({ items }); // Return items in an object structure

    } catch (error) {
        console.error(`[Menu Controller] Error fetching items for menu ID ${menuId}:`, error);
        res.status(500).json({ message: 'Error fetching menu items', error: error.message });
    }
};


// GET /api/menu/public/:restaurantSlug - Get public menu data by restaurant slug
exports.getPublicMenuBySlug = async (req, res) => {
    const { restaurantSlug } = req.params;
    console.log(`[Menu Controller] Get public menu request for slug: ${restaurantSlug}`);

    try {
        // 1. Find the restaurant by slug
        const restaurant = await db('restaurants').where({ slug: restaurantSlug }).first();
        if (!restaurant) {
            // Check if the slug column exists, provide helpful error if not
             try {
                await db('restaurants').select('slug').limit(1);
            } catch (slugError) {
                 if (slugError.message.includes('Unknown column')) { // Check error message specifics
                    console.error("[Menu Controller] 'slug' column likely missing from 'restaurants' table.");
                    return res.status(500).json({ message: "Server configuration error: Missing 'slug' identifier." });
                 }
                 // Rethrow other errors
                 throw slugError;
            }
            return res.status(404).json({ message: 'Restaurant not found.' });
        }

        // 2. Find the primary/active menu for the restaurant (assuming one for now)
        const menu = await db('menus').where({ restaurant_id: restaurant.id }).first(); // Add logic if multiple menus possible
        if (!menu) {
            return res.status(404).json({ message: 'Menu not found for this restaurant.' });
        }

        // 3. Find categories for the restaurant
        const categories = await db('categories')
            .where({ restaurant_id: restaurant.id })
            .orderBy('name'); // Or custom order

        // 4. Find menu items for this menu
        const menuItems = await db('menu_items')
            .where({ menu_id: menu.id })
            .orderBy('category_id')
            .orderBy('name');

        // 5. Find the active template for the restaurant
        // Assuming template model/logic exists as per backend/routes/templates.js
        // We might need to import Template model or query directly
        // Ensure new style columns are selected
        const activeTemplate = await db('templates')
            .where({ restaurant_id: restaurant.id, is_active: true })
            .select('*') // Explicitly select all columns including new ones
            .first();
            
        // Parse JSON settings if they exist
        if (activeTemplate && activeTemplate.customization_settings && typeof activeTemplate.customization_settings === 'string') {
            try {
                activeTemplate.customization_settings = JSON.parse(activeTemplate.customization_settings);
            } catch (e) {
                console.error(`Error parsing customization_settings for active template ID ${activeTemplate.id}:`, e);
                activeTemplate.customization_settings = null; // Set to null on error
            }
        }


        // Structure the response
        const categoriesWithItems = categories.map(category => ({
            ...category,
            items: menuItems.filter(item => item.category_id === category.id)
        }));
        const uncategorizedItems = menuItems.filter(item => item.category_id === null);

        console.log(`[Menu Controller] Public menu data fetched for slug: ${restaurantSlug}`);
        res.json({
            restaurant: { // Send basic restaurant info
                id: restaurant.id,
                name: restaurant.name,
                description: restaurant.description,
                logo_path: restaurant.logo_path,
                slug: restaurant.slug,
                currency_code: restaurant.currency_code,
                allow_remove_branding: restaurant.allow_remove_branding, // Include branding flag
                custom_footer_text: restaurant.custom_footer_text // Include custom footer
            },
            menu: { // Send menu details
                id: menu.id,
                name: menu.name,
                description: menu.description,
                categories: categoriesWithItems,
                uncategorizedItems: uncategorizedItems
            },
            template: activeTemplate || { // Send active template or defaults
                // Provide sensible defaults if no template is active/found
                background_color: '#ffffff',
                text_color: '#000000',
                accent_color: '#4a90e2',
                font_family: 'Arial, sans-serif',
                layout_type: 'grid',
            }
        });

    } catch (error) {
        console.error(`[Menu Controller] Error fetching public menu for slug ${restaurantSlug}:`, error);
        res.status(500).json({ message: 'Error fetching menu data', error: error.message });
    }
};
