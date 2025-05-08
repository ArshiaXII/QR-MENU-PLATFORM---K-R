const qrcode = require('qrcode');
require('dotenv').config();

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000'; // Default if not set

// GET /api/qr/generate/:restaurantId
exports.generateQrCode = async (req, res) => {
    const { restaurantId } = req.params;

    if (!restaurantId) {
        return res.status(400).json({ message: 'Restaurant ID is required' });
    }

    // Construct the URL for the public menu page
    // Assuming the frontend route is something like /menu/:restaurantId
    const menuUrl = `${FRONTEND_URL}/menu/${restaurantId}`;

    console.log(`[QR Controller] Generating QR code for URL: ${menuUrl}`);

    try {
        // Generate QR code as a Data URL (base64 encoded image)
        const qrCodeDataUrl = await qrcode.toDataURL(menuUrl, {
            errorCorrectionLevel: 'H', // High error correction level
            type: 'image/png',
            margin: 1, // Margin around the QR code
            // color: { dark: '#000000', light: '#ffffff' } // Optional color customization
        });

        console.log(`[QR Controller] QR code generated successfully for restaurant ID: ${restaurantId}`);
        // Send the Data URL back to the client
        res.json({
            message: 'QR code generated successfully',
            restaurantId: restaurantId,
            menuUrl: menuUrl,
            qrCodeDataUrl: qrCodeDataUrl
        });

    } catch (error) {
        console.error(`[QR Controller] Error generating QR code for restaurant ID ${restaurantId}:`, error);
        res.status(500).json({ message: 'Failed to generate QR code', error: error.message });
    }
};