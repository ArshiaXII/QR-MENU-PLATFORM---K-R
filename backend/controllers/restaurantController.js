const db = require('../db/db'); // Knex instance
const slugify = require('slugify'); // Import slugify
const { customAlphabet } = require('nanoid'); // For generating short unique IDs for slugs

// Helper function to generate a unique slug
const generateUniqueSlug = async (name, currentRestaurantId = null) => {
    const nanoid = customAlphabet('1234567890abcdef', 6); // 6-char alphanumeric ID
    let baseSlug = slugify(name, { lower: true, strict: true, remove: /[*+~.()'"!:@]/g }); // Remove problematic chars
    if (!baseSlug) { // Handle cases where slugify might return empty string (e.g., only symbols in name)
        baseSlug = 'restaurant';
    }
    let slug = baseSlug;
    let counter = 0;
    let existing = null;

    do {
        // Check if slug exists, excluding the current restaurant being updated (if applicable)
        const query = db('restaurants').where({ slug });
        if (currentRestaurantId) {
            query.andWhereNot('id', currentRestaurantId);
        }
        existing = await query.first();

        if (existing) {
            counter++;
            // Append nanoid for uniqueness instead of just a number
            slug = `${baseSlug}-${nanoid()}`;
        }
         // Basic loop protection (optional)
         if (counter > 10) {
             console.error(`[Slug Generation] Could not generate unique slug for "${name}" after ${counter} attempts. Last tried: ${slug}`);
             // Fallback to a more random slug or throw error
             slug = `${baseSlug}-${nanoid(10)}`; // Longer random part
             break;
         }
    } while (existing);

    return slug;
};


// GET /api/restaurants/me - Get the authenticated user's restaurant profile
exports.getMyRestaurant = async (req, res) => {
    const userId = req.user.id; // From authMiddleware
    console.log(`[Restaurant Controller] Get profile request for user ID: ${userId}`);

    try {
        // Fetch the full restaurant object first to get all fields
        const restaurantData = await db('restaurants').where({ user_id: userId }).select('*').first();

        if (!restaurantData) {
            console.log(`[Restaurant Controller] No restaurant profile found for user ID: ${userId}`);
            return res.status(200).json({ restaurant: null });
        }

        // Also fetch the primary menu ID for convenience
        let menu = await db('menus').where({ restaurant_id: restaurantData.id }).select('id').first();

        // --- >>> START: Auto-create default menu if missing <<< ---
        if (!menu) {
            console.warn(`[Restaurant Controller] No menu found for existing restaurant ID: ${restaurantData.id}. Creating default menu.`);
            try {
                // Use write-then-read as returning might not work
                await db('menus').insert({
                    restaurant_id: restaurantData.id,
                    name: 'Main Menu', // Default name
                    description: 'Our main selection of items.', // Default description
                });
                 menu = await db('menus').where({ restaurant_id: restaurantData.id }).select('id').orderBy('created_at', 'desc').first(); // Fetch the newly created one
                console.log(`[Restaurant Controller] Default menu created for restaurant ID: ${restaurantData.id}`);
            } catch (menuError) {
                console.error(`[Restaurant Controller] Failed to create default menu for existing restaurant ID ${restaurantData.id}:`, menuError);
                // menu remains null
            }
        }
         // --- >>> END: Auto-create default menu if missing <<< ---

        // Assign menuId to the fetched restaurant data
        restaurantData.menuId = menu ? menu.id : null; 

        console.log(`[Restaurant Controller] Found restaurant profile ID: ${restaurantData.id} for user ID: ${userId}, Menu ID: ${restaurantData.menuId}, Onboarding: ${restaurantData.onboarding_completed}`);
        res.json({ restaurant: restaurantData }); // Send the full object

    } catch (error) {
        console.error(`[Restaurant Controller] Error fetching restaurant profile for user ID ${userId}:`, error);
        res.status(500).json({ message: 'Error fetching restaurant profile', error: error.message });
    }
};

// PUT /api/restaurants/me - Create or update the authenticated user's restaurant profile
exports.upsertMyRestaurant = async (req, res) => {
    const userId = req.user.id;
    // Add branding fields to destructuring
    const { name, description, logo_path, currency_code, allow_remove_branding, custom_footer_text } = req.body; 

    // Basic validation
    if (!name) {
        return res.status(400).json({ message: 'Restaurant name is required' });
    }

    console.log(`[Restaurant Controller] Upsert profile request for user ID: ${userId}`);

    try {
        // 1. Check if restaurant exists
        const existingRestaurant = await db('restaurants').where({ user_id: userId }).first();

        let generatedSlug;
        if (existingRestaurant) {
            // Update: Generate slug, excluding self from uniqueness check
            generatedSlug = await generateUniqueSlug(name, existingRestaurant.id);
        } else {
            // Create: Generate slug
            generatedSlug = await generateUniqueSlug(name);
        }

        const restaurantData = {
            user_id: userId,
            name,
            slug: generatedSlug, 
            description: description || null,
            logo_path: logo_path || null,
            currency_code: currency_code || 'USD', 
            allow_remove_branding: allow_remove_branding !== undefined ? !!allow_remove_branding : false, 
            custom_footer_text: custom_footer_text || null, 
            onboarding_completed: true, // Mark onboarding as completed on save
            updated_at: db.fn.now() 
        };

        let restaurantIdToFetch;

        if (existingRestaurant) {
            // Update existing restaurant
            console.log(`[Restaurant Controller] Updating restaurant ID: ${existingRestaurant.id} with slug: ${generatedSlug}`);
            await db('restaurants')
                .where({ id: existingRestaurant.id })
                .update(restaurantData);
            restaurantIdToFetch = existingRestaurant.id;
        } else {
            // Insert new restaurant
            console.log(`[Restaurant Controller] Creating new restaurant with slug: ${generatedSlug}`);
             // Remove updated_at for insert, let DB handle created_at/updated_at defaults if set up
             delete restaurantData.updated_at;
             // Use write-then-read for insert ID
             await db('restaurants').insert(restaurantData);
             const newRestaurant = await db('restaurants').where({user_id: userId}).orderBy('created_at', 'desc').first(); // Fetch the newly inserted one
             restaurantIdToFetch = newRestaurant?.id;


            // --- >>> START: Auto-create default menu for new restaurant <<< ---
            if (newRestaurant && newRestaurant.id) {
                 console.log(`[Restaurant Controller] New restaurant created (ID: ${newRestaurant.id}). Creating default menu.`);
                 try {
                     await db('menus').insert({
                         restaurant_id: newRestaurant.id,
                         name: 'Main Menu', // Default name
                         description: 'Our main selection of items.', // Default description
                     });
                     console.log(`[Restaurant Controller] Default menu created for restaurant ID: ${newRestaurant.id}`);
                 } catch (menuError) {
                     console.error(`[Restaurant Controller] Failed to create default menu for new restaurant ID ${newRestaurant.id}:`, menuError);
                 }
            }
            // --- >>> END: Auto-create default menu <<< ---
        }

        // Fetch the final state explicitly for consistency (including the potentially just created menu)
        const finalRestaurantData = await db('restaurants').where({ id: restaurantIdToFetch }).first();

        // Also fetch the primary menu ID for convenience
        const finalMenu = await db('menus').where({ restaurant_id: finalRestaurantData.id }).select('id').first();
        finalRestaurantData.menuId = finalMenu ? finalMenu.id : null;

        console.log(`[Restaurant Controller] Profile upserted successfully for user ID: ${userId}, Restaurant ID: ${finalRestaurantData.id}`);
        res.status(200).json({ message: 'Restaurant profile updated successfully', restaurant: finalRestaurantData });

    } catch (error) {
        console.error(`[Restaurant Controller] Error upserting restaurant profile for user ID ${userId}:`, error);
        res.status(500).json({ message: 'Error updating restaurant profile', error: error.message });
    }
};
