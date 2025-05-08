const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

// Ensure the data directory exists
const fs = require('fs');
const dataDir = path.resolve(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log("Created data directory.");
}

const dbPath = path.resolve(__dirname, process.env.DATABASE_PATH || './data/menu.sqlite');
let db = null;

function initDB() {
  db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Error opening database:', err.message);
    } else {
      console.log('Connected to the SQLite database:', dbPath);
      initializeDatabase();
    }
  });
  return db;
}

function initializeDatabase() {
  db.serialize(() => {
    // Users Table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
      )
    `, (err) => {
      if (err) console.error("Error creating users table:", err.message);
      else console.log("Users table checked/created.");
    });

    // Categories Table
    db.run(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `, (err) => {
        if (err) console.error("Error creating categories table:", err.message);
        else console.log("Categories table checked/created.");
    });

    // Products Table
    db.run(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL, -- Denormalized for easier lookup/auth checks potentially
        name TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        image_path TEXT, -- Path to the uploaded image
        FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `, (err) => {
        if (err) console.error("Error creating products table:", err.message);
        else console.log("Products table checked/created.");
    });

  });
}

// Initialize the database connection right away
db = initDB();

module.exports = { db, initDB };
