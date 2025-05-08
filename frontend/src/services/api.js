import axios from 'axios';

// Use environment variable for API URL with a fallback
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api'; // Updated port to 5001

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 seconds timeout
    withCredentials: false // Disable cookies and credentials for now to troubleshoot
});

// Log configuration on startup
console.log(`[API Service] Initialized with baseURL: ${API_URL}`);

// Add a request interceptor to include the token if it exists
api.interceptors.request.use(
    (config) => {
        console.log(`[API Service] Making request to: ${config.baseURL}${config.url}`);
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
            console.log('[API Service] Added auth token to request');
        }
        return config;
    },
    (error) => {
        console.error('[API Service] Request interceptor error:', error);
        return Promise.reject(error);
    }
);

// Optional: Add a response interceptor (e.g., for global error handling or auto-logout on 401)
api.interceptors.response.use(
    (response) => {
        console.log(`[API Service] Received response from ${response.config.url}:`, {
            status: response.status,
            statusText: response.statusText
        });
        return response;
    },
    (error) => {
        console.error('[API Service] Response error:');
        if (error.response) {
            // Server responded with a status code outside of 2xx range
            console.error(`  Status: ${error.response.status} - ${error.response.statusText}`);
            if (error.response.status === 401) {
                console.warn('[API Service] Received 401 Unauthorized. Clearing auth state and reloading.');
                // Clear auth token and user data from localStorage
                localStorage.removeItem('authToken');
                localStorage.removeItem('authUser');
                // Reload the page - ProtectedRoute in App.js will redirect to /login
                window.location.reload();
                // We don't need to reject the promise here as the page will reload
                return new Promise(() => {}); // Return a pending promise to prevent further processing
            }
        } else if (error.request) {
            // Request was made but no response received
            console.error('  No response received. Server might be down or CORS issue.');
        } else {
            // Something happened in setting up the request
            console.error(`  Error message: ${error.message}`);
        }
        
        return Promise.reject(error); // Important: Reject the promise so individual calls can handle errors
    }
);

export default api;
