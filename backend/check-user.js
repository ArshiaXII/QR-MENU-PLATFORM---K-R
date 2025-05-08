const db = require('./db/db');
require('dotenv').config();

async function checkUser(email) {
    try {
        console.log(`Checking if user with email '${email}' exists...`);
        
        // Check if user exists
        const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
        
        if (user) {
            console.log('User found:', {
                id: user.id,
                email: user.email,
                restaurant_name: user.restaurant_name,
                password: user.password ? '(password hash exists)' : '(no password)'
            });
            return user;
        } else {
            console.log('No user found with that email');
            return null;
        }
    } catch (error) {
        console.error('Error checking user:', error);
        throw error;
    }
}

// Check for the test user
checkUser('test@example.com')
    .then(() => {
        console.log('Check completed');
    })
    .catch(err => {
        console.error('Error during check:', err);
    }); 