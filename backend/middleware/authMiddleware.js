const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

const authMiddleware = (req, res, next) => {
    // Get token from header
    const authHeader = req.header('Authorization');

    // Check if not token
    if (!authHeader) {
        console.log("[Auth Middleware] Access denied. No token provided.");
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Check if token is in the correct format 'Bearer <token>'
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        console.log("[Auth Middleware] Access denied. Token format is invalid.");
        return res.status(401).json({ message: 'Token format is invalid (must be Bearer token)' });
    }

    const token = parts[1];

    try {
        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);

        // Add user from payload to request object
        req.user = decoded; // Contains { id, email, role }
        console.log(`[Auth Middleware] Token verified for user ID: ${req.user.id}`);
        next(); // Proceed to the next middleware or route handler
    } catch (err) {
        console.error("[Auth Middleware] Token verification failed:", err.message);
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token is expired' });
        }
        res.status(401).json({ message: 'Token is not valid' });
    }
};

module.exports = authMiddleware;
