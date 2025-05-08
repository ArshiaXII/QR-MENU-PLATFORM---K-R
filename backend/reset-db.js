const db = require('./db/db');
const fs = require('fs');
const path = require('path');

async function resetDatabase() {
    try {
        console.log('Starting database reset...');
        
        // Get the database path
        const dbPath = path.join(__dirname, 'data', 'qrmenu.db');
        console.log('Database path:', dbPath);
        
        // Close the existing connection
        try {
            await db.close();
            console.log('Database connection closed');
        } catch (err) {
            console.warn('Error closing database connection:', err.message);
        }
        
        // Delete the existing database file
        try {
            if (fs.existsSync(dbPath)) {
                fs.unlinkSync(dbPath);
                console.log('Existing database file deleted');
            } else {
                console.log('No existing database file found');
            }
        } catch (err) {
            console.error('Error deleting database file:', err);
            throw err;
        }
        
        // Reconnect to create a fresh database
        // This will be done automatically when we use db.exec
        
        // Create tables with the correct schemas
        console.log('Creating tables with correct schemas...');
        
        // 1. Create restaurants table
        await db.exec(`
            CREATE TABLE IF NOT EXISTS restaurants (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                name TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Restaurants table created');
        
        // 2. Create users table
        await db.exec(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Users table created');
        
        // 3. Create categories table
        await db.exec(`
            CREATE TABLE IF NOT EXISTS categories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                restaurant_id INTEGER NOT NULL,
                name TEXT NOT NULL,
                description TEXT,
                display_order INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
            )
        `);
        console.log('Categories table created');
        
        // 4. Create products table
        await db.exec(`
            CREATE TABLE IF NOT EXISTS products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                category_id INTEGER NOT NULL,
                name TEXT NOT NULL,
                description TEXT,
                price REAL NOT NULL,
                image_url TEXT,
                is_available BOOLEAN DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (category_id) REFERENCES categories(id)
            )
        `);
        console.log('Products table created');

        console.log('Database reset and tables created successfully!');
    } catch (error) {
        console.error('Error resetting database:', error);
        throw error;
    } finally {
        // Close the database connection when done
        try {
            await db.close();
            console.log('Database connection closed');
        } catch (err) {
            console.warn('Error closing final database connection:', err.message);
        }
    }
}

resetDatabase()
    .then(() => console.log('Database reset completed'))
    .catch(err => console.error('Fatal error during database reset:', err)); 