const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Template = require('../models/template');
const auth = require('../middleware/auth');
const db = require('../db/db'); // Import the Knex instance

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads/logos');
        
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `logo-${req.user.restaurant_id}-${uniqueSuffix}${ext}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
    fileFilter: (req, file, cb) => {
        // Accept only images
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    }
});

// Get active template for current restaurant
router.get('/active', auth, async (req, res) => {
    try {
        const template = await Template.getActiveByRestaurant(req.user.restaurant_id);
        
        if (!template) {
            // Return default template if none exists
            return res.json({
                restaurant_id: req.user.restaurant_id,
                background_color: '#ffffff',
                text_color: '#000000',
                accent_color: '#4a90e2',
                font_family: 'Arial, sans-serif',
                header_text: 'Restaurant Menu',
                layout_type: 'grid',
                is_active: true
            });
        }
        
        res.json(template);
    } catch (error) {
        console.error('Error fetching active template:', error);
        res.status(500).json({ error: 'Failed to fetch template' });
    }
});

// Get available templates (global and user-specific)
router.get('/available', auth, async (req, res) => {
    try {
        const restaurantId = req.user.restaurant_id; // Can be null if user has no restaurant
        console.log(`[Templates Route /available] Fetching available templates for restaurant ID: ${restaurantId}`);
        const templates = await Template.getAvailableForRestaurant(restaurantId);
        res.json(templates);
    } catch (error) {
        console.error('Error fetching available templates:', error);
        res.status(500).json({ error: 'Failed to fetch available templates' });
    }
});

// Get all templates for current restaurant (user's own templates)
router.get('/all', auth, async (req, res) => {
    try {
        // Explicitly check if restaurant_id exists on req.user
        const restaurantId = req.user.restaurant_id;
        if (!restaurantId) {
            console.warn(`[Templates Route /all] User ${req.user.id} has no restaurant_id associated with their token.`);
            // Return empty array, as the user has no restaurant to have templates for yet.
            return res.json([]);
        }

        console.log(`[Templates Route /all] Fetching templates for restaurant ID: ${restaurantId}`);
        const templates = await Template.getAllByRestaurant(restaurantId);
        res.json(templates);
    } catch (error) {
        console.error('Error fetching templates:', error);
        res.status(500).json({ error: 'Failed to fetch templates' });
    }
});

// Get template by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const template = await Template.getById(req.params.id, req.user.restaurant_id);
        
        if (!template) {
            return res.status(404).json({ error: 'Template not found' });
        }
        
        res.json(template);
    } catch (error) {
        console.error('Error fetching template:', error);
        res.status(500).json({ error: 'Failed to fetch template' });
    }
});

// For backward compatibility - get active template
router.get('/', auth, async (req, res) => {
    try {
        const template = await Template.getActiveByRestaurant(req.user.restaurant_id);
        
        if (!template) {
            // Return default template if none exists
            return res.json({
                restaurant_id: req.user.restaurant_id,
                background_color: '#ffffff',
                text_color: '#000000',
                accent_color: '#4a90e2',
                font_family: 'Arial, sans-serif',
                header_text: 'Restaurant Menu',
                layout_type: 'grid',
                is_active: true
            });
        }
        
        res.json(template);
    } catch (error) {
        console.error('Error fetching template:', error);
        res.status(500).json({ error: 'Failed to fetch template' });
    }
});

// Create or update active template
router.post('/', auth, upload.single('logo'), async (req, res) => {
    try {
        const templateData = {
            restaurant_id: req.user.restaurant_id,
            name: req.body.name || 'Custom Template',
            background_color: req.body.background_color,
            text_color: req.body.text_color,
            accent_color: req.body.accent_color,
            font_family: req.body.font_family,
            header_text: req.body.header_text || 'Restaurant Menu',
            layout_type: req.body.layout_type,
            is_active: true
        };
        
        if (req.file) {
            templateData.logo_url = `/uploads/logos/${req.file.filename}`;
        } else if (req.body.logo_url) {
            templateData.logo_url = req.body.logo_url;
        }
        
        // Deactivate current active template
        await Template.deactivateAllByRestaurant(req.user.restaurant_id);
        
        const template = await Template.create(templateData);
        res.status(201).json(template);
    } catch (error) {
        console.error('Error creating/updating template:', error);
        res.status(500).json({ error: 'Failed to create/update template' });
    }
});

// Save template (non-active)
router.post('/save', auth, async (req, res) => {
    try {
        const templateData = {
            restaurant_id: req.user.restaurant_id,
            name: req.body.name,
            background_color: req.body.background_color,
            text_color: req.body.text_color,
            accent_color: req.body.accent_color,
            font_family: req.body.font_family,
            header_text: req.body.header_text || 'Restaurant Menu',
            layout_type: req.body.layout_type,
            logo_url: req.body.logo_url,
            is_active: false
        };
        
        const template = await Template.create(templateData);
        res.status(201).json(template);
    } catch (error) {
        console.error('Error saving template:', error);
        res.status(500).json({ error: 'Failed to save template' });
    }
});

// PUT /api/templates/:id - Update a specific template (owned by user)
router.put('/:id', auth, async (req, res) => {
    try {
        const templateId = parseInt(req.params.id);
        const userRestaurantId = req.user.restaurant_id;
        const updateData = req.body; // Contains name, customization_settings, etc.

        if (!userRestaurantId) {
            return res.status(403).json({ error: 'User does not have an associated restaurant.' });
        }
        if (!templateId) {
             return res.status(400).json({ error: 'Template ID is required.' });
        }

        // The Template.update method includes verification that the template belongs to the user
        const updatedTemplate = await Template.update(templateId, userRestaurantId, updateData);

        res.json(updatedTemplate); // Return the full updated template object

    } catch (error) {
        console.error(`Error updating template ID ${req.params.id}:`, error);
        // Provide more specific error messages if possible
        if (error.message.includes('not found or does not belong')) {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Failed to update template' });
    }
});

// Activate a template
router.put('/:id/activate', auth, async (req, res) => {
    try {
        const templateIdToActivate = parseInt(req.params.id); // Ensure it's a number
        const userRestaurantId = req.user.restaurant_id;

        if (!userRestaurantId) {
            return res.status(400).json({ error: 'User does not have an associated restaurant to activate a template for.' });
        }

        // Fetch the template by ID first to see if it's global or user-specific
        const potentialTemplate = await db('templates').where({ id: templateIdToActivate }).first();

        if (!potentialTemplate) {
            return res.status(404).json({ error: 'Template not found.' });
        }

        // If it's a user-specific template, it must belong to the current user's restaurant
        if (potentialTemplate.restaurant_id !== null && potentialTemplate.restaurant_id !== userRestaurantId) {
            return res.status(403).json({ error: 'Forbidden: Template does not belong to your restaurant.' });
        }
        
        // Deactivate all templates for this restaurant (this is handled within Template.activate now)
        // await Template.deactivateAllByRestaurant(userRestaurantId); // Model handles this

        // Activate the template (model logic will handle copying if it's a global one)
        const activatedTemplate = await Template.activate(templateIdToActivate, userRestaurantId);

        res.json(activatedTemplate);
    } catch (error) {
        console.error('Error activating template:', error);
        res.status(500).json({ error: 'Failed to activate template' });
    }
});

// Delete a template
router.delete('/:id', auth, async (req, res) => {
    try {
        const templateId = req.params.id;
        
        // Check if template exists and belongs to this restaurant
        const template = await Template.getById(templateId, req.user.restaurant_id);
        if (!template) {
            return res.status(404).json({ error: 'Template not found' });
        }
        
        // Delete logo file if exists
        if (template.logo_url) {
            const logoPath = path.join(__dirname, '..', template.logo_url.replace(/^\/uploads/, 'uploads'));
            if (fs.existsSync(logoPath)) {
                fs.unlinkSync(logoPath);
            }
        }

        // If trying to delete active template, return error
        if (template.is_active) {
            return res.status(400).json({ error: 'Cannot delete active template' });
        }

        // Pass restaurantId for verification
        await Template.delete(templateId, req.user.restaurant_id);
        res.json({ message: 'Template deleted successfully' });
    } catch (error) {
        console.error('Error deleting template:', error);
        res.status(500).json({ error: 'Failed to delete template' });
    }
});

module.exports = router;
