const db = require('./db/db');
require('dotenv').config();

async function checkAllUsers() {
    try {
        console.log('Listing all users in the database:');
        
        // Get all users
        const users = await db.all('SELECT * FROM users');
        
        if (users && users.length > 0) {
            console.log(`Found ${users.length} users:`);
            users.forEach((user, i) => {
                console.log(`User ${i + 1}:`, {
                    id: user.id,
                    email: user.email,
                    restaurant_name: user.restaurant_name,
                    password: user.password ? '(password hash exists)' : '(no password)',
                    created_at: user.created_at
                });
            });
        } else {
            console.log('No users found in the database');
        }
    } catch (error) {
        console.error('Error checking users:', error);
        throw error;
    }
}

// Check all users
checkAllUsers()
    .then(() => {
        console.log('Check completed');
    })
    .catch(err => {
        console.error('Error during check:', err);
    }); 