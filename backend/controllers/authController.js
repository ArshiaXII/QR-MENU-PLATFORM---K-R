const db = require('../db/db'); // Knex instance
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

// POST /register
exports.register = async (req, res) => {
    console.log("[Auth Controller] Register request received.");
    let { email, password } = req.body; // Use let to allow modification
    console.log("[Auth Controller] Register Body:", { email, password: '[REDACTED]' });

    // Trim email before validation
    email = email ? email.trim() : '';

    if (!email || !password) {
        console.log("[Auth Controller] Register failed: Missing email or password.");
        return res.status(400).json({ message: 'Email and password are required' });
    }
    // Basic email format validation (more robust validation recommended for production)
    if (!/\S+@\S+\.\S+/.test(email)) { // Validate trimmed email
         console.log("[Auth Controller] Register failed: Invalid email format.");
        return res.status(400).json({ message: 'Invalid email format' });
    }
    if (password.length < 6) {
        console.log("[Auth Controller] Register failed: Password too short.");
        return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    try {
        // Check if user already exists
        console.log("[Auth Controller] Finding user by email:", email);
        const existingUser = await db('users').where({ email }).first();

        if (existingUser) {
            console.log("[Auth Controller] Register failed: Email already taken.");
            return res.status(409).json({ message: 'Email already registered' }); // 409 Conflict
        }

        // Hash password
        console.log("[Auth Controller] Hashing password for email:", email);
        const saltRounds = 10; // Standard practice
        const password_hash = await bcrypt.hash(password, saltRounds);
        console.log("[Auth Controller] Password hashed.");

        // Create new user (default role is 'owner' as per migration)
        console.log("[Auth Controller] Email available, creating user:", email);
        const [newUser] = await db('users').insert({
            email,
            password_hash
        }).returning(['id', 'email', 'role', 'created_at']); // Return basic info

        console.log("[Auth Controller] User created successfully:", { userId: newUser.id, email: newUser.email });
        // Optionally create restaurant profile and subscription trial here or require separate step

        res.status(201).json({
            message: 'User registered successfully',
            user: { id: newUser.id, email: newUser.email, role: newUser.role }
        });

    } catch (error) {
        console.error("[Auth Controller] Error during registration:", error);
        res.status(500).json({ message: 'Error registering user', error: error.message });
    }
};

// POST /login
exports.login = async (req, res) => {
    console.log("[Auth Controller] Login request received.");
    const { email, password } = req.body;
    console.log("[Auth Controller] Login Body:", { email, password: '[REDACTED]' });

    if (!email || !password) {
        console.log("[Auth Controller] Login failed: Missing email or password.");
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        // Find user by email
        console.log("[Auth Controller] Finding user by email:", email);
        const user = await db('users').where({ email }).first();

        if (!user) {
            console.log("[Auth Controller] Login failed: User not found.");
            return res.status(401).json({ message: 'Invalid credentials' }); // Unauthorized
        }

        // Compare password
        console.log("[Auth Controller] User found, comparing password for email:", email);
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            console.log("[Auth Controller] Login failed: Password mismatch for email:", email);
            return res.status(401).json({ message: 'Invalid credentials' }); // Unauthorized
        }

        // Passwords match, fetch associated restaurant ID
        console.log("[Auth Controller] Password matched, fetching restaurant ID for user:", user.id);
        const restaurant = await db('restaurants').where({ user_id: user.id }).select('id').first();
        const restaurantId = restaurant ? restaurant.id : null; // May be null if profile not created yet
        console.log("[Auth Controller] Found restaurant ID:", restaurantId);

        // Create JWT payload including restaurantId
        console.log("[Auth Controller] Generating JWT for email:", email);
        const payload = {
            id: user.id,
            email: user.email,
            role: user.role,
            restaurant_id: restaurantId // Include restaurant_id
        };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

        console.log("[Auth Controller] Login successful for email:", email);
        res.json({
            message: 'Login successful',
            token,
            user: { 
                id: user.id, 
                email: user.email, 
                role: user.role, 
                restaurant_id: restaurantId // Include restaurant_id here
            } 
        });

    } catch (error) {
        console.error("[Auth Controller] Error during login:", error);
        res.status(500).json({ message: 'Error during login', error: error.message });
    }
};

// GET /me - Requires authentication middleware to be applied in routes
exports.getMe = async (req, res) => {
    // req.user should be populated by the auth middleware with JWT payload ({ id, email, role })
    if (!req.user || !req.user.id) {
         console.error("[Auth Controller] /me endpoint called without authenticated user.");
        return res.status(401).json({ message: 'Not authenticated' });
    }

    console.log(`[Auth Controller] /me request received for user ID: ${req.user.id}`);

    try {
        // Fetch user details from DB based on ID from token
        // Exclude password_hash
        const user = await db('users')
            .where({ id: req.user.id })
            .select('id', 'email', 'role', 'created_at', 'updated_at')
            .first();

        if (!user) {
            console.error(`[Auth Controller] Authenticated user ID ${req.user.id} not found in database.`);
            // This case should ideally not happen if JWT is valid and user wasn't deleted
            return res.status(404).json({ message: 'User not found' });
        }

        console.log(`[Auth Controller] Returning user details for ID: ${user.id}`);
        res.json({ user });

    } catch (error) {
        console.error(`[Auth Controller] Error fetching user details for ID ${req.user.id}:`, error);
        res.status(500).json({ message: 'Error fetching user details', error: error.message });
    }
};
