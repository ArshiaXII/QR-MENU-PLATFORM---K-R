const fetch = require('node-fetch');

async function testLogin() {
    try {
        console.log('Testing login to backend...');
        
        const response = await fetch('http://localhost:3001/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'test@example.com', 
                password: 'password123'
            })
        });
        
        console.log('Response status:', response.status);
        
        const data = await response.json();
        console.log('Response data:', data);
        
        return data;
    } catch (error) {
        console.error('Error testing login:', error);
    }
}

testLogin(); 