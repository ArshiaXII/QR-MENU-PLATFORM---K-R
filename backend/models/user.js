const db = require('../db/db');
const bcrypt = require('bcrypt');

class User {
    static createTable() {
        return db.run(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                restaurant_name TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
    }

    static async getById(id) {
        const sql = `
            SELECT id, email, restaurant_name, created_at 
            FROM users 
            WHERE id = ?
        `;
        
        try {
            return await db.get(sql, [id]);
        } catch (error) {
            console.error('Error getting user by ID:', error);
            throw error;
        }
    }

    static async getByEmail(email) {
        const sql = `
            SELECT * FROM users 
            WHERE email = ?
        `;
        
        try {
            return await db.get(sql, [email]);
        } catch (error) {
            console.error('Error getting user by email:', error);
            throw error;
        }
    }

    static async create(userData) {
        const { email, password, restaurant_name } = userData;
        
        const sql = `
            INSERT INTO users (email, password, restaurant_name)
            VALUES (?, ?, ?)
        `;
        
        try {
            const result = await db.run(sql, [email, password, restaurant_name]);
            
            return {
                id: result.lastID,
                email,
                restaurant_name
            };
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    }

    static async update(id, userData) {
        const { email, name, restaurant_id, role } = userData;
        
        const sql = `
            UPDATE users 
            SET email = ?, name = ?, restaurant_id = ?, role = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;
        
        try {
            await db.run(sql, [email, name, restaurant_id, role, id]);
            return await this.getById(id);
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    }

    static async updatePassword(id, newPassword) {
        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        
        const sql = `
            UPDATE users 
            SET password = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;
        
        try {
            await db.run(sql, [hashedPassword, id]);
            return true;
        } catch (error) {
            console.error('Error updating password:', error);
            throw error;
        }
    }

    static async delete(id) {
        const sql = `
            DELETE FROM users 
            WHERE id = ?
        `;
        
        try {
            await db.run(sql, [id]);
            return true;
        } catch (error) {
            console.error('Error deleting user:', error);
            throw error;
        }
    }

    static async verifyPassword(user, password) {
        try {
            return await bcrypt.compare(password, user.password);
        } catch (error) {
            console.error('Error verifying password:', error);
            throw error;
        }
    }
}

module.exports = User;
