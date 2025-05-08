const db = require('../db/db'); // Knex instance

// GET /api/subscription/status - Get current subscription status for the user's restaurant
exports.getSubscriptionStatus = async (req, res) => {
    const restaurantId = req.user.restaurant_id; // From authMiddleware

    if (!restaurantId) {
        return res.status(400).json({ message: 'Restaurant association required to get subscription status.' });
    }

    try {
        let subscription = await db('subscriptions').where({ restaurant_id: restaurantId }).first();

        if (!subscription) {
            // If no subscription record, create a default 'trial' or 'free' one
            console.log(`[Subscription Controller] No subscription found for restaurant ${restaurantId}. Creating default trial.`);
            const defaultPlanName = 'Trial'; // Or 'Free'
            const defaultPlanIdentifier = 'trial_monthly'; // Or 'free_tier'
            const trialEndDate = new Date();
            trialEndDate.setDate(trialEndDate.getDate() + 30); // Example: 30-day trial

            [subscription] = await db('subscriptions').insert({
                restaurant_id: restaurantId,
                status: 'trial', // Default status
                plan_name: defaultPlanName,
                plan_identifier: defaultPlanIdentifier,
                start_date: new Date(),
                current_period_end: trialEndDate,
                // stripe_customer_id and stripe_subscription_id will be null
            }).returning('*');
        }
        
        // Parse stripe_customer_id if it's stored as JSON (it's a string, so no parse needed)
        // Ensure all relevant fields are returned
        const { id, status, plan_name, plan_identifier, start_date, current_period_end, stripe_customer_id, stripe_subscription_id } = subscription;

        res.json({ 
            id, 
            status, 
            planName: plan_name, 
            planIdentifier: plan_identifier,
            startDate: start_date, 
            currentPeriodEnd: current_period_end,
            stripeCustomerId: stripe_customer_id, // Keep for potential future use
            stripeSubscriptionId: stripe_subscription_id // Keep for potential future use
        });

    } catch (error) {
        console.error(`[Subscription Controller] Error fetching subscription status for restaurant ${restaurantId}:`, error);
        res.status(500).json({ message: 'Failed to get subscription status.' });
    }
};

// POST /api/subscription/create-checkout-session (Mocked)
// This would normally interact with Stripe to create a real session
exports.createCheckoutSession = async (req, res) => {
    const restaurantId = req.user.restaurant_id;
    const { planIdentifier, planName } = req.body; // e.g., 'basic_monthly', 'Premium Plan'

    if (!restaurantId) {
        return res.status(400).json({ message: 'Restaurant association required.' });
    }
    if (!planIdentifier || !planName) {
        return res.status(400).json({ message: 'Plan identifier and name are required.' });
    }

    console.log(`[Subscription Controller] Mock checkout session for restaurant ${restaurantId}, plan: ${planIdentifier}`);

    // In a real scenario:
    // 1. Get or create Stripe Customer ID for the restaurant.
    // 2. Create Stripe Checkout session with price ID for the planIdentifier.
    // 3. Return session ID or URL to frontend.

    // Mock response:
    res.json({ 
        message: `Mock checkout session created for ${planName}.`,
        // In a real setup, you'd redirect to a Stripe URL or use Stripe.js with a session ID.
        // For mock, we can simulate an immediate "upgrade".
        mockUpgrade: true, 
        planIdentifier,
        planName
    });
};

// POST /api/subscription/manage (Mocked)
// This would normally redirect to Stripe Customer Portal
exports.manageSubscription = async (req, res) => {
    const restaurantId = req.user.restaurant_id;
    if (!restaurantId) return res.status(400).json({ message: 'Restaurant association required.' });
    
    // In a real scenario:
    // 1. Get stripe_customer_id for the restaurant.
    // 2. Create a Stripe Customer Portal session.
    // 3. Return the session URL.

    console.log(`[Subscription Controller] Mock manage subscription for restaurant ${restaurantId}`);
    res.json({ 
        message: 'Mock subscription management. In a real app, this would redirect to a customer portal.',
        portalUrl: `http://localhost:3000/dashboard/billing?mock_portal_session_for_restaurant_${restaurantId}` // Example mock URL
    });
};


// POST /api/subscription/webhook (Example - Not fully implemented for mock)
// This is where Stripe would send events.
exports.stripeWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    // For a real webhook, you'd verify the signature:
    // try {
    //   event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    // } catch (err) {
    //   console.error(`Webhook signature verification failed: ${err.message}`);
    //   return res.sendStatus(400);
    // }
    
    event = req.body; // For mock, just use the body directly
    console.log('[Subscription Controller] Mock Webhook received:', event.type);

    // Handle the event (mock examples)
    switch (event.type) {
        case 'checkout.session.completed':
        case 'invoice.payment_succeeded':
            // const session = event.data.object;
            // const restaurantId = session.client_reference_id; // If you set this during checkout
            // const stripeCustomerId = session.customer;
            // const stripeSubscriptionId = session.subscription;
            // const planId = session.display_items[0].plan.id; // Or however plan is identified
            // const currentPeriodEnd = new Date(session.subscription_details.current_period_end * 1000);
            // Update your database with subscription details
            console.log('Mock: Payment successful, update subscription in DB.');
            break;
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted': // or 'customer.subscription.canceled'
            // const subscription = event.data.object;
            // Update subscription status in your DB
            console.log('Mock: Subscription updated/canceled, update DB.');
            break;
        default:
            console.log(`Mock: Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
};
