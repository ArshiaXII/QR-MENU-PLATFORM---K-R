const db = require('../db/db'); // Knex instance
const crypto = require('crypto');

// Helper to hash IP (basic anonymization)
const hashIp = (ip) => {
  if (!ip) return null;
  return crypto.createHash('sha256').update(ip).digest('hex');
};

// POST /api/analytics/log-visit
exports.logMenuVisit = async (req, res) => {
  const { menuId, restaurantId } = req.body; // Frontend should send menuId and restaurantId
  const ipAddress = req.ip || req.socket?.remoteAddress;
  const userAgent = req.headers['user-agent'];

  if (!menuId || !restaurantId) {
    return res.status(400).json({ message: 'Menu ID and Restaurant ID are required.' });
  }

  try {
    const ipHash = hashIp(ipAddress);

    const [visit] = await db('menu_visits').insert({
      restaurant_id: parseInt(restaurantId),
      menu_id: parseInt(menuId),
      ip_address_hash: ipHash,
      user_agent: userAgent,
    }).returning(['id', 'visit_timestamp']); // Return ID and timestamp

    console.log(`[Analytics] Menu visit logged: Visit ID ${visit.id} for Menu ID ${menuId}`);
    res.status(201).json({ message: 'Visit logged successfully', visitId: visit.id, timestamp: visit.visit_timestamp });
  } catch (error) {
    console.error('[Analytics] Error logging menu visit:', error);
    res.status(500).json({ message: 'Failed to log visit' });
  }
};

// POST /api/analytics/log-item-view
exports.logItemView = async (req, res) => {
  const { itemId, visitId } = req.body;

  if (!itemId || !visitId) {
    return res.status(400).json({ message: 'Item ID and Visit ID are required.' });
  }

  try {
    await db('item_views').insert({
      menu_item_id: parseInt(itemId),
      visit_id: parseInt(visitId),
      // view_timestamp is defaulted by DB
    });
    console.log(`[Analytics] Item view logged: Item ID ${itemId} for Visit ID ${visitId}`);
    res.status(201).json({ message: 'Item view logged successfully' });
  } catch (error) {
    console.error('[Analytics] Error logging item view:', error);
    res.status(500).json({ message: 'Failed to log item view' });
  }
};

// GET /api/analytics/summary (Protected by authMiddleware)
exports.getAnalyticsSummary = async (req, res) => {
  const restaurantId = req.user.restaurant_id; // From authMiddleware

  if (!restaurantId) {
    return res.status(400).json({ message: 'Restaurant association required.' });
  }

  console.log(`[Analytics] Fetching summary for restaurant ID: ${restaurantId}`);

  try {
    // Total Menu Visits
    const totalVisitsResult = await db('menu_visits')
      .where({ restaurant_id: restaurantId })
      .count('id as totalVisits')
      .first();
    const totalVisits = totalVisitsResult ? parseInt(totalVisitsResult.totalVisits) : 0;

    // Top Viewed Items (e.g., top 5)
    // This query joins item_views with menu_items to get item names
    // and then groups by item_id and name to count views.
    const topItems = await db('item_views')
      .join('menu_items', 'item_views.menu_item_id', 'menu_items.id')
      .join('menus', 'menu_items.menu_id', 'menus.id') // Join with menus
      .where('menus.restaurant_id', restaurantId) // Filter by restaurant_id from menus table
      .select('menu_items.id', 'menu_items.name')
      .count('item_views.id as viewCount')
      .groupBy('menu_items.id', 'menu_items.name')
      .orderBy('viewCount', 'desc')
      .limit(5);

    res.json({
      totalMenuVisits: totalVisits,
      topViewedItems: topItems,
      // Add more stats as needed (e.g., views over time, unique visitors based on ip_hash)
    });
  } catch (error) {
    console.error(`[Analytics] Error fetching summary for restaurant ID ${restaurantId}:`, error);
    res.status(500).json({ message: 'Failed to fetch analytics summary' });
  }
};

// Placeholder for old functions if they were used by other parts or for reference
exports.getMenuViews = async (req, res) => {
    res.status(501).json({message: "Not implemented / deprecated. Use /summary."})
};
exports.getTopItems = async (req, res) => {
    res.status(501).json({message: "Not implemented / deprecated. Use /summary."})
};
exports.logView = async (req, res) => {
    res.status(501).json({message: "Not implemented / deprecated. Use /log-visit or /log-item-view."})
};
