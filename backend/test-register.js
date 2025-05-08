const Restaurant = require('./models/restaurant');
const User = require('./models/user');
const bcrypt = require('bcrypt');
require('dotenv').config();

// Log to indicate we are running this test
console.log('Starting test-register.js');
console.log('Environment variables loaded:', {
    JWT_SECRET: process.env.JWT_SECRET ? 'Defined' : 'Undefined',
    DATABASE_PATH: process.env.DATABASE_PATH
});

// Test function to try creating a restaurant
async function testCreateRestaurant() {
    try {
        console.log('1. Attempting to create a restaurant...');
        
        const restaurant = await Restaurant.create({
            name: 'Test Restaurant',
            description: 'Test Description',
            address: 'Test Address',
            phone: '123-456-7890',
            email: 'test@example.com',
            website: 'example.com',
            logo_url: ''
        });
        
        console.log('Restaurant created successfully:', restaurant);
        return restaurant;
    } catch (error) {
        console.error('Error creating restaurant:', error);
        throw error;
    }
}

// Test function to try creating a user
async function testCreateUser(restaurantId) {
    try {
        console.log('2. Attempting to create a user...');
        
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);
        
        const user = await User.create({
            email: 'test2@example.com',
            password: hashedPassword,
            name: 'Test User',
            restaurant_id: restaurantId,
            role: 'owner'
        });
        
        console.log('User created successfully:', user);
        return user;
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
}

// Run the test
async function runTest() {
    try {
        const restaurant = await testCreateRestaurant();
        const user = await testCreateUser(restaurant.id);
        console.log('Test completed successfully!');
    } catch (error) {
        console.error('Test failed:', error);
    }
}

runTest(); 