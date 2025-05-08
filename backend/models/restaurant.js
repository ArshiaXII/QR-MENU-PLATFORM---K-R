const db = require('../db/db');

class Restaurant {
    static createTable() {
        return db.run(`
            CREATE TABLE IF NOT EXISTS restaurants (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                name TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
    }

    static async getById(id) {
        const sql = `
            SELECT * FROM restaurants 
            WHERE id = ?
        `;
        
        try {
            return await db.get(sql, [id]);
        } catch (error) {
            console.error('Error getting restaurant:', error);
            throw error;
        }
    }

    static async getByUser(userId) {
        const sql = `
            SELECT r.* FROM restaurants r
            JOIN users u ON r.id = u.restaurant_id
            WHERE u.id = ?
        `;
        
        try {
            return await db.get(sql, [userId]);
        } catch (error) {
            console.error('Error getting restaurant by user:', error);
            throw error;
        }
    }

    static async getAll() {
        const sql = `
            SELECT * FROM restaurants
            ORDER BY name
        `;
        
        try {
            return await db.all(sql);
        } catch (error) {
            console.error('Error getting all restaurants:', error);
            throw error;
        }
    }

    static async create(restaurantData) {
        const { name } = restaurantData;
        
        const sql = `
            INSERT INTO restaurants (name)
            VALUES (?)
        `;
        
        try {
            const result = await db.run(sql, [name]);
            
            return {
                id: result.lastID,
                name
            };
        } catch (error) {
            console.error('Error creating restaurant:', error);
            throw error;
        }
    }

    static async update(id, restaurantData) {
        const { 
            name, 
            description, 
            address,
            phone,
            email,
            website,
            logo_url
        } = restaurantData;
        
        const sql = `
            UPDATE restaurants 
            SET name = ?, description = ?, address = ?, 
                phone = ?, email = ?, website = ?, logo_url = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;
        
        try {
            await db.run(
                sql, 
                [name, description, address, phone, email, website, logo_url, id]
            );
            
            return await this.getById(id);
        } catch (error) {
            console.error('Error updating restaurant:', error);
            throw error;
        }
    }

    static async delete(id) {
        const sql = `
            DELETE FROM restaurants 
            WHERE id = ?
        `;
        
        try {
            await db.run(sql, [id]);
            return true;
        } catch (error) {
            console.error('Error deleting restaurant:', error);
            throw error;
        }
    }
}

module.exports = Restaurant; 