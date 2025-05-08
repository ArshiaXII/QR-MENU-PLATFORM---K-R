const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config(); // Load .env variables

// Ensure uploads directory exists
const uploadsDir = path.resolve(__dirname, '..', process.env.UPLOAD_DIR || 'uploads'); // Use path.resolve for absolute path from .env
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir); // Save files to the 'uploads' directory
    },
    filename: function (req, file, cb) {
        // Create a unique filename: fieldname-timestamp.extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter (optional: restrict to image types)
const fileFilter = (req, file, cb) => {
    // Accept images only
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Not an image! Please upload only images.'), false);
        // Or silently reject: cb(null, false);
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // Read limit from .env (default 5MB)
    },
    fileFilter: fileFilter
});

module.exports = upload; 