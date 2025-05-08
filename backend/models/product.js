const db = require('../db/db');

class Product {
    static createTable() {
        return db.run(`
            CREATE TABLE IF NOT EXISTS products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                restaurant_id INTEGER NOT NULL,
                category_id INTEGER NOT NULL,
                name TEXT NOT NULL,
                description TEXT,
                price DECIMAL(10,2) NOT NULL,
                image_path TEXT,
                display_order INTEGER DEFAULT 0,
                is_available BOOLEAN DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (restaurant_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
            )
        `);
    }

    static async getAllByCategory(categoryId, restaurantId) {
        const sql = `
            SELECT * FROM products 
            WHERE category_id = ? AND restaurant_id = ? 
            ORDER BY display_order ASC
        `;
        
        try {
            return await db.all(sql, [categoryId, restaurantId]);
        } catch (error) {
            console.error('Error getting products:', error);
            throw error;
        }
    }

    static async getById(id, restaurantId) {
        const sql = `
            SELECT * FROM products 
            WHERE id = ? AND restaurant_id = ?
        `;
        
        try {
            return await db.get(sql, [id, restaurantId]);
        } catch (error) {
            console.error('Error getting product:', error);
            throw error;
        }
    }

    static async create(productData) {
        const { 
            restaurant_id, 
            category_id, 
            name, 
            description, 
            price,
            image_path = null 
        } = productData;
        
        // Get highest display_order
        const maxOrderSql = `
            SELECT MAX(display_order) as max_order 
            FROM products 
            WHERE category_id = ? AND restaurant_id = ?
        `;
        
        try {
            const result = await db.get(maxOrderSql, [category_id, restaurant_id]);
            const newOrder = result.max_order !== null ? result.max_order + 1 : 0;
            
            const sql = `
                INSERT INTO products (
                    restaurant_id, 
                    category_id, 
                    name, 
                    description, 
                    price, 
                    image_path, 
                    display_order
                )
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;
            
            const insertResult = await db.run(
                sql, 
                [restaurant_id, category_id, name, description, price, image_path, newOrder]
            );
            
            return {
                id: insertResult.lastID,
                restaurant_id,
                category_id,
                name,
                description,
                price,
                image_path,
                display_order: newOrder
            };
        } catch (error) {
            console.error('Error creating product:', error);
            throw error;
        }
    }

    static async update(id, productData) {
        const { 
            restaurant_id, 
            category_id, 
            name, 
            description, 
            price,
            image_path 
        } = productData;
        
        let sql, params;
        
        if (image_path) {
            sql = `
                UPDATE products 
                SET category_id = ?, name = ?, description = ?, price = ?, image_path = ?
                WHERE id = ? AND restaurant_id = ?
            `;
            params = [category_id, name, description, price, image_path, id, restaurant_id];
        } else {
            sql = `
                UPDATE products 
                SET category_id = ?, name = ?, description = ?, price = ?
                WHERE id = ? AND restaurant_id = ?
            `;
            params = [category_id, name, description, price, id, restaurant_id];
        }
        
        try {
            await db.run(sql, params);
            return await this.getById(id, restaurant_id);
        } catch (error) {
            console.error('Error updating product:', error);
            throw error;
        }
    }

    static async delete(id, restaurantId) {
        const sql = `
            DELETE FROM products 
            WHERE id = ? AND restaurant_id = ?
        `;
        
        try {
            await db.run(sql, [id, restaurantId]);
            return true;
        } catch (error) {
            console.error('Error deleting product:', error);
            throw error;
        }
    }

    static async updateOrder(products) {
        const sql = `
            UPDATE products 
            SET display_order = ? 
            WHERE id = ?
        `;
        
        try {
            const promises = products.map(product => 
                db.run(sql, [product.display_order, product.id])
            );
            
            await Promise.all(promises);
            return true;
        } catch (error) {
            console.error('Error updating product order:', error);
            throw error;
        }
    }

    static async updateAvailability(id, restaurantId, isAvailable) {
        return db.run(
            'UPDATE products SET is_available = ? WHERE id = ? AND restaurant_id = ?',
            [isAvailable, id, restaurantId]
        );
    }
}

module.exports = Product;
