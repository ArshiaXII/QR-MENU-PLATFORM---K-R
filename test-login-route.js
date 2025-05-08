// This script tests the login route directly using fetch
const fetch = require('node-fetch');

async function testLoginRoute() {
    const email = 'test@example.com';
    const password = 'password123';

    console.log(`Testing login with email: ${email} and password: ${password}`);
    
    try {
        const response = await fetch('http://localhost:3001/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        console.log('Response status:', response.status);
        
        const data = await response.json();
        console.log('Response data:', data);
        
        if (response.ok) {
            console.log('Login successful!');
            console.log('Token:', data.token.substring(0, 20) + '...');
            console.log('User:', data.user);
        } else {
            console.log('Login failed!');
            console.log('Error:', data.error || 'Unknown error');
        }
    } catch (error) {
        console.error('Fetch error:', error.message);
    }
}

testLoginRoute(); 