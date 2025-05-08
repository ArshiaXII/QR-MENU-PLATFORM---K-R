/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('restaurants', function(table) {
    table.string('stripe_customer_id').nullable().unique().index(); 
    // Unique because one Stripe customer should map to one restaurant in our system.
    // Index for faster lookups.
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('restaurants', function(table) {
    table.dropColumn('stripe_customer_id');
  });
};
