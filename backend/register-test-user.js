const db = require('./db/db'); // Knex instance (db.js already loads dotenv)
const bcrypt = require('bcrypt');

async function registerTestUser() {
    try {
        console.log('Registering a test user directly...');

        // User data
        const email = 'test@example.com'; // Using email
        const password = 'password123';
        const restaurantName = 'Test Restaurant';

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // First, check if the user already exists
        const existingUser = await db('users').where({ email: email }).first(); // Use Knex syntax with email

        if (existingUser) {
            console.log('User already exists:', {
                id: existingUser.id,
                email: existingUser.email, // Use email
                // restaurant_name might not be directly on users table anymore
            });
            // Optionally fetch associated restaurant if needed
            return existingUser;
        }

        // Use a transaction to ensure atomicity
        await db.transaction(async (trx) => {
            // 1. Create the user
            console.log('Creating user...');
            const [userId] = await trx('users').insert({ // Use Knex syntax, get inserted ID
                email: email, // Use email
                password: hashedPassword,
                // Removed restaurantName from users table insert
            }).returning('id'); // Get the ID of the inserted user

            console.log(`User created with ID: ${userId.id || userId}`); // Adjust based on DB driver return format

            // 2. Create the restaurant, linking it to the user
            console.log('Creating restaurant...');
            const [restaurantId] = await trx('restaurants').insert({ // Use Knex syntax
                user_id: userId.id || userId, // Use the obtained user ID
                name: restaurantName,
            }).returning('id');

            console.log(`Restaurant created with ID: ${restaurantId.id || restaurantId}`);

            // Get the created user details (excluding password)
            const user = await trx('users').where({ id: userId.id || userId }).select('id', 'email', 'created_at').first(); // Select email

            console.log('Registered user:', user);

            console.log('\nYou can now log in with:');
            console.log(`Email: ${email}`); // Use email
            console.log(`Password: ${password}`);

            return user; // Return user from transaction if needed elsewhere
        });

    } catch (error) {
        console.error('Error registering test user:', error);
        // Check for specific DB connection errors
        if (error.code === 'ECONNREFUSED') {
             console.error('\n*** Database Connection Error: Ensure your MySQL server is running and accessible. ***\n');
        }
        throw error; // Re-throw the error after logging
    } finally {
        // Ensure the database connection is closed
        await db.destroy();
        console.log('Database connection closed.');
    }
}

registerTestUser()
    .then(() => console.log('Test user registration script finished.'))
    .catch(error => console.error('Registration script failed:', error.message));