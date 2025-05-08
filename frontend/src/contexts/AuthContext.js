import React, { createContext, useState, useEffect } from 'react';
// import axios from 'axios'; // No longer needed directly
import api from '../services/api'; // Import the configured Axios instance

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('authToken'));
    const [isLoading, setIsLoading] = useState(true); // Renamed loading to isLoading

    useEffect(() => {
        const checkLoggedIn = async () => {
            const storedToken = localStorage.getItem('authToken');
            if (storedToken) {
                console.log("Token found in localStorage, attempting to load user data...");
                setToken(storedToken);
                // No need to set default header here, api interceptor handles it
                try {
                    const storedUser = localStorage.getItem('authUser');
                    if(storedUser) {
                        setUser(JSON.parse(storedUser));
                        console.log("User data loaded from localStorage");
                    } else {
                         // If only token exists, maybe try a /me endpoint if we had one
                         // If not, it's often better to logout to force re-authentication
                         console.warn("Token exists but no user data in localStorage. Logging out.");
                         logout(); // Call logout to clear token
                    }
                } catch (error) {
                    console.error("Error parsing stored user data:", error);
                    logout(); // Clear invalid state
                }
            } else {
                 console.log("No auth token found in localStorage.");
            }
            setIsLoading(false); // Use setIsLoading
        };
        checkLoggedIn();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Added logout to dependency array if it were used inside, but it's defined outside effect scope

    // Original Login Function (Uses API)
    const login = async (email, password) => { // Changed username back to email
        try {
            console.log(`[AuthContext] Making login request to ${api.defaults.baseURL}/auth/login`);
            // Use the api instance
            const response = await api.post('/auth/login', { email, password }); // Use email
            console.log('[AuthContext] Raw login response:', response);

            if (response.data && response.data.token) {
                const { token: receivedToken, user: userData } = response.data;
                localStorage.setItem('authToken', receivedToken);
                localStorage.setItem('authUser', JSON.stringify(userData));
                setToken(receivedToken);
                
                // Fetch subscription status immediately after getting user data
                let finalUserData = userData;
                if (userData.restaurant_id) {
                    try {
                        console.log(`[AuthContext] Fetching subscription status for restaurant ID: ${userData.restaurant_id}`);
                        const subRes = await api.get('/subscription/status'); // Uses token from interceptor
                        if (subRes.data && subRes.data.subscription) {
                            // Add subscription details to the user object
                            finalUserData = { ...userData, subscription: subRes.data.subscription };
                            console.log("[AuthContext] Subscription data fetched:", subRes.data.subscription);
                        } else {
                             console.warn("[AuthContext] No subscription data found in response for restaurant:", userData.restaurant_id);
                             finalUserData = { ...userData, subscription: null }; // Explicitly set to null
                        }
                    } catch (subError) {
                        console.error("[AuthContext] Failed to fetch subscription status during login:", subError);
                        // Proceed without subscription data, maybe show error later
                        finalUserData = { ...userData, subscription: null }; 
                    }
                } else {
                     console.log("[AuthContext] No restaurant_id found for user, skipping subscription fetch.");
                     finalUserData = { ...userData, subscription: null };
                }

                // Store potentially augmented user data
                localStorage.setItem('authUser', JSON.stringify(finalUserData)); 
                setUser(finalUserData); 
                
                console.log("[AuthContext] Login successful, token and user (with subscription) stored.");
                return { success: true };
            } else {
                console.error('[AuthContext] No token received in response:', response.data);
                throw new Error('No token received');
            }
        } catch (error) {
            console.error('[AuthContext] Login error:');
            if (error.response) {
                // Server responded with a status code outside of 2xx range
                console.error('  Status:', error.response.status);
                console.error('  Data:', error.response.data);
                console.error('  Headers:', error.response.headers);
            } else if (error.request) {
                // Request was made but no response received
                console.error('  No response received:', error.request);
            } else {
                // Something happened in setting up the request
                console.error('  Error message:', error.message);
            }
            console.error('  Error config:', error.config);

            logout(); // Ensure clean state on login failure
            return {
                success: false,
                message: error.response?.data?.message || 'Login failed. Please check your credentials and ensure the server is running.'
            };
        }
    };

    // Original Signup Function (Uses API)
    const signup = async (email, password) => { // Changed username back to email
         try {
             console.log(`[AuthContext] Making signup request to ${api.defaults.baseURL}/auth/register`); // Use /register endpoint
             // Use the api instance
             const response = await api.post('/auth/register', { email, password }); // Use email
             console.log("[AuthContext] Signup successful:", response.data);
             // Assuming backend returns a success message upon registration
             return { success: true, message: response.data.message || 'Signup successful! Please log in.' };
         } catch (error) {
             console.error('[AuthContext] Signup error:');
             if (error.response) {
                 // Server responded with a status code outside of 2xx range
                 console.error('  Status:', error.response.status);
                 console.error('  Data:', error.response.data);
                 console.error('  Headers:', error.response.headers);
             } else if (error.request) {
                 // Request was made but no response received
                 console.error('  No response received:', error.request);
             } else {
                 // Something happened in setting up the request
                 console.error('  Error message:', error.message);
             }
             console.error('  Error config:', error.config);

            return {
                success: false,
                message: error.response?.data?.message || 'Signup failed. Please try again and ensure the server is running.'
            };
         }
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
        setToken(null);
        setUser(null);
        // Axios interceptor will handle removing header on next request
        console.log("User logged out.");
    };

    const value = {
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading, // Use isLoading
        login,
        signup,
        logout,
    };

    // Don't render children until isLoading is complete to avoid state flashes
    if (isLoading) { // Use isLoading
        return <div className="flex justify-center items-center h-screen">Loading authentication state...</div>; // Added basic centering
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;

// Custom hook to use the auth context
export const useAuth = () => {
    const context = React.useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
