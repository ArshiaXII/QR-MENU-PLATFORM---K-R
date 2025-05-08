const db = require('../db/db'); // Knex instance (will be needed later)
const fs = require('fs'); // For file system operations if needed
const path = require('path');
// const axios = require('axios'); // To call external enhancement API
require('dotenv').config();

const UPLOAD_DIR = path.resolve(__dirname, '..', process.env.UPLOAD_DIR || 'uploads');
// const REAL_ESRGAN_API_URL = process.env.REAL_ESRGAN_API_URL;

// POST /api/image/upload
// This is triggered after multer saves the file via uploadMiddleware
exports.uploadImage = async (req, res) => {
    if (!req.file) {
        console.log("[Image Controller] Upload failed: No file received.");
        return res.status(400).json({ message: 'No image file uploaded' });
    }

    console.log(`[Image Controller] File received: ${req.file.originalname}, Size: ${req.file.size}, Path: ${req.file.path}`);

    /* DB Logic (pending connection fix)
    const userId = req.user.id; // From authMiddleware
    const { path: filePath, originalname: originalName, mimetype: mimeType, size, filename } = req.file;
    // Store path relative to the backend root? Or just the filename? Let's use filename and assume served from /uploads
    const relativePath = `/uploads/${filename}`; // URL path

    try {
        const [newImage] = await db('images').insert({
            user_id: userId,
            file_path: relativePath, // Or absolute path? Decide storage strategy
            original_name: originalName,
            mime_type: mimeType,
            size: size
        }).returning('*');
        console.log(`[Image Controller] Image metadata saved to DB: ID ${newImage.id}`);
        res.status(201).json({
            message: 'Image uploaded successfully',
            imageData: { // Return info about the uploaded file
                id: newImage.id, // DB id
                filename: req.file.filename, // Generated filename
                path: `/uploads/${req.file.filename}`, // URL path to access the file
                originalName: newImage.original_name,
                mimeType: newImage.mime_type,
                size: newImage.size
            }
        });
    } catch (error) {
        console.error("[Image Controller] Error saving image metadata to DB:", error);
        // Optional: Clean up uploaded file if DB insert fails?
        // fs.unlink(req.file.path, (err) => {...});
        res.status(500).json({ message: 'Error saving image information', error: error.message });
    }
    */

    // Placeholder response until DB is ready
    res.status(201).json({ // Send 201 Created
        message: 'Image uploaded successfully (DB save pending)',
        imageData: {
            filename: req.file.filename,
            path: `/uploads/${req.file.filename}`, // Construct URL path
            originalName: req.file.originalname,
            mimeType: req.file.mimetype,
            size: req.file.size
        }
    });
};

// POST /api/image/enhance
exports.enhanceImage = async (req, res) => {
    const { imagePath } = req.body; // Expecting the path or ID of the image to enhance

    if (!imagePath) {
        return res.status(400).json({ message: 'Image path is required for enhancement' });
    }

    /* TODO: Implement enhancement logic
    1. Validate imagePath (does it exist? does user own it?) - Requires DB access
    2. Construct full path to the image file.
    3. Send image data to the Real-ESRGAN API endpoint (e.g., using axios).
       - Handle API response (success/failure).
       - The API might return the enhanced image data directly or a path to the result.
    4. Save the enhanced image (e.g., with a suffix like '_enhanced').
    5. Update the database record if necessary (e.g., store path to enhanced version).
    6. Return the path/URL of the enhanced image.
    */

    console.log(`[Image Controller] Enhancement requested for: ${imagePath}`);
    // if (!REAL_ESRGAN_API_URL) {
    //     console.warn("[Image Controller] REAL_ESRGAN_API_URL not set in .env");
    //     return res.status(501).json({ message: 'Image enhancement service not configured' });
    // }

    // Placeholder response
    res.status(501).json({ message: 'Not Implemented: Enhance Image', requestedPath: imagePath });
};