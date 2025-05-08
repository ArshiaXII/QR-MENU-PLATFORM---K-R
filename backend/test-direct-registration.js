const db = require('./db/db');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function testDirectRegistration() {
    try {
        console.log('Testing direct registration...');
        
        // 1. Create a user
        const email = 'testdirect@example.com';
        const password = 'password123';
        
        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        // Insert user
        console.log('Creating user...');
        const userResult = await db.run(
            'INSERT INTO users (email, password) VALUES (?, ?)',
            [email, hashedPassword]
        );
        console.log('User created with ID:', userResult.lastID);
        
        // Create a restaurant for the user
        const restaurantName = 'Test Direct Restaurant';
        console.log('Creating restaurant...');
        const restaurantResult = await db.run(
            'INSERT INTO restaurants (user_id, name) VALUES (?, ?)',
            [userResult.lastID, restaurantName]
        );
        console.log('Restaurant created with ID:', restaurantResult.lastID);
        
        // Verify the created records
        const user = await db.get('SELECT * FROM users WHERE id = ?', [userResult.lastID]);
        console.log('Created user:', user);
        
        const restaurant = await db.get('SELECT * FROM restaurants WHERE id = ?', [restaurantResult.lastID]);
        console.log('Created restaurant:', restaurant);
        
        console.log('Direct registration test completed successfully!');
    } catch (error) {
        console.error('Error in direct registration test:', error);
    }
}

testDirectRegistration(); 