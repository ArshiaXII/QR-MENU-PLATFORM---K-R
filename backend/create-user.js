const db = require('./db/db');
const bcrypt = require('bcrypt');

async function createTestUser() {
    try {
        console.log('Creating test user directly with SQL...');
        
        // 1. First, let's check if the users table exists and has the correct schema
        const usersTable = await db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='users'");
        if (!usersTable) {
            console.log('Creating users table...');
            await db.exec(`
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    email TEXT UNIQUE NOT NULL,
                    password TEXT NOT NULL,
                    name TEXT,
                    role TEXT DEFAULT 'owner',
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `);
            console.log('Users table created');
        } else {
            console.log('Users table already exists');
        }
        
        // 2. Hash the password
        const password = 'password123';
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        // 3. Create user
        console.log('Inserting test user...');
        const email = 'test@example.com';
        
        // Check if user already exists
        const existingUser = await db.get('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUser) {
            console.log('User already exists:', existingUser);
            return existingUser;
        }
        
        // Insert new user
        const result = await db.run(
            'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
            [email, hashedPassword, 'Test User', 'owner']
        );
        
        console.log('User created with ID:', result.lastID);
        
        // 4. Retrieve the created user
        const user = await db.get('SELECT * FROM users WHERE id = ?', [result.lastID]);
        console.log('Created user:', user);
        
        return user;
    } catch (error) {
        console.error('Error creating test user:', error);
        throw error;
    }
}

createTestUser()
    .then(() => console.log('User creation completed'))
    .catch(err => console.error('Error in script:', err)); 