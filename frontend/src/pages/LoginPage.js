import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Import useAuth hook

const LoginPage = () => {
    const [formData, setFormData] = useState({
        email: '', // Changed back to email
        password: ''
    });
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false); // Local submitting state

    const { login, isAuthenticated, isLoading: authLoading } = useAuth(); // Get login function and auth state
    const navigate = useNavigate();

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated && !authLoading) {
            navigate('/dashboard/overview', { replace: true });
        }
    }, [isAuthenticated, authLoading, navigate]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            // Use the login function from AuthContext
            const result = await login(formData.email, formData.password); // Use email

            if (result.success) {
                // Navigation is handled by the useEffect hook checking isAuthenticated
                console.log("Login successful, redirecting...");
            } else {
                setError(result.message || 'Login failed. Please check your credentials.');
            }
        } catch (err) {
            // Catch any unexpected errors during login call itself
            console.error('Unexpected login error:', err);
            setError('An unexpected error occurred during login.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Don't render form if initial auth check is loading or already authenticated
    if (authLoading) {
        return <div className="flex justify-center items-center h-screen">Checking authentication...</div>;
    }
     if (isAuthenticated) {
        return null; // Or a redirect component, though useEffect handles it
    }


    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-md">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Sign in to your account
                    </h2>
                </div>
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <input type="hidden" name="remember" defaultValue="true" />
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="email-address" className="sr-only">Email address</label>
                            <input
                                id="email-address"
                                name="email" // Changed back to email
                                type="email" // Changed back to email
                                autoComplete="email"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Email address" // Changed back to Email address
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">Password</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* Optional: Add Remember me / Forgot password */}
                    {/* <div className="flex items-center justify-between">
                        <div className="text-sm">
                            <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                                Forgot your password?
                            </a>
                        </div>
                    </div> */}

                    <div>
                        <button
                            type="submit"
                            disabled={isSubmitting || authLoading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                            {isSubmitting ? 'Signing in...' : 'Sign in'}
                        </button>
                    </div>
                </form>
                 <p className="mt-2 text-center text-sm text-gray-600">
                    Don't have an account?{' '}
                    <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
                        Register here
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
