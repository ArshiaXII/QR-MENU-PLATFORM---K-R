const db = require('../db/db');

class Category {
    static createTable() {
        return db.run(`
            CREATE TABLE IF NOT EXISTS categories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                restaurant_id INTEGER NOT NULL,
                name TEXT NOT NULL,
                description TEXT,
                display_order INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (restaurant_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);
    }

    static async getAllByRestaurant(restaurantId) {
        const sql = `
            SELECT * FROM categories 
            WHERE restaurant_id = ? 
            ORDER BY display_order ASC
        `;
        
        try {
            return await db.all(sql, [restaurantId]);
        } catch (error) {
            console.error('Error getting categories:', error);
            throw error;
        }
    }

    static async create(categoryData) {
        const { restaurant_id, name, description, display_order = 0 } = categoryData;
        
        // Get highest display_order
        const maxOrderSql = `
            SELECT MAX(display_order) as max_order 
            FROM categories 
            WHERE restaurant_id = ?
        `;
        
        try {
            const result = await db.get(maxOrderSql, [restaurant_id]);
            const newOrder = result.max_order !== null ? result.max_order + 1 : 0;
            
            const sql = `
                INSERT INTO categories (restaurant_id, name, description, display_order)
                VALUES (?, ?, ?, ?)
            `;
            
            const insertResult = await db.run(
                sql, 
                [restaurant_id, name, description, newOrder]
            );
            
            return {
                id: insertResult.lastID,
                restaurant_id,
                name,
                description,
                display_order: newOrder
            };
        } catch (error) {
            console.error('Error creating category:', error);
            throw error;
        }
    }

    static async update(id, restaurantId, name, description) {
        const sql = `
            UPDATE categories 
            SET name = ?, description = ?
            WHERE id = ? AND restaurant_id = ?
        `;
        
        try {
            await db.run(sql, [name, description, id, restaurantId]);
            return true;
        } catch (error) {
            console.error('Error updating category:', error);
            throw error;
        }
    }

    static async delete(id, restaurantId) {
        const sql = `
            DELETE FROM categories 
            WHERE id = ? AND restaurant_id = ?
        `;
        
        try {
            await db.run(sql, [id, restaurantId]);
            return true;
        } catch (error) {
            console.error('Error deleting category:', error);
            throw error;
        }
    }

    static async updateOrder(categories) {
        const sql = `
            UPDATE categories 
            SET display_order = ? 
            WHERE id = ?
        `;
        
        try {
            const promises = categories.map(category => 
                db.run(sql, [category.display_order, category.id])
            );
            
            await Promise.all(promises);
            return true;
        } catch (error) {
            console.error('Error updating category order:', error);
            throw error;
        }
    }
}

module.exports = Category;
