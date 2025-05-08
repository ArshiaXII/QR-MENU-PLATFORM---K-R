/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('subscriptions', function(table) {
    table.string('stripe_customer_id').nullable().index(); // For quick lookup
    table.string('stripe_subscription_id').nullable().unique(); // Unique Stripe subscription ID
    table.string('stripe_plan_id').nullable(); // ID of the Stripe Price/Plan
    table.string('plan_name').nullable(); // e.g., "Basic", "Premium"
    table.timestamp('current_period_end').nullable(); // From Stripe, when the current billing period ends

    // Modify existing status column if needed, or rely on it.
    // Stripe has its own set of statuses (active, past_due, canceled, unpaid, trialing, incomplete, incomplete_expired)
    // We might want to map these to our existing 'status' enum or add a new 'stripe_status' column.
    // For now, let's assume our existing 'status' will be updated based on Stripe events.
    // Example: If Stripe status is 'active' or 'trialing', our status is 'active' or 'trial'.
    // If Stripe status is 'canceled' or 'incomplete_expired', our status becomes 'cancelled' or 'inactive'.
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('subscriptions', function(table) {
    table.dropColumn('stripe_customer_id');
    table.dropColumn('stripe_subscription_id');
    table.dropColumn('stripe_plan_id');
    table.dropColumn('plan_name');
    table.dropColumn('current_period_end');
  });
};
