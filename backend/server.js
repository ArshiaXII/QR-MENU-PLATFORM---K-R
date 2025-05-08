const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const morgan = require('morgan');
const fs = require('fs');

// Load environment variables
dotenv.config();

// Database connection is handled by requiring './db/db' where needed.
// No explicit global init here. Knex manages the pool.

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/menu', require('./routes/menu'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/restaurants', require('./routes/restaurants')); // Add restaurant routes
app.use('/api/image', require('./routes/image'));
app.use('/api/qr', require('./routes/qr'));
app.use('/api/templates', require('./routes/templates')); // Add template routes
app.use('/api/analytics', require('./routes/analytics')); // Placeholder for analytics routes
app.use('/api/subscription', require('./routes/subscription')); // Placeholder for subscription routes

// Simple route for testing
app.get('/', (req, res) => {
    res.json({ message: 'QR Menu API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    if (err.message === 'Only image files are allowed') {
        return res.status(400).json({ error: 'Only image files are allowed' });
    }
    res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    // console.log(`Database connection status checked in db.js`); // Connection check is now in db.js
    console.log(`Using database: ${process.env.DB_NAME} on ${process.env.DB_HOST}:${process.env.DB_PORT}`);
    console.log(`Make sure your .env file is configured correctly.`);
    console.log(`Access the API at http://localhost:${PORT}`);
});
