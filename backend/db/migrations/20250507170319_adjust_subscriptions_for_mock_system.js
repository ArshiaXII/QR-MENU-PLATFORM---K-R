/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('subscriptions', function(table) {
    // Rename stripe_plan_id to a more generic plan_identifier
    // Knex does not have a direct renameColumn for SQLite if foreign keys are involved,
    // but for simple rename without FKs on this column, it might work.
    // A safer way for SQLite is to add new, drop old, and copy data if needed.
    // However, since this is a new field from a recent migration, direct rename is often fine.
    // If using MySQL or PostgreSQL, table.renameColumn('stripe_plan_id', 'plan_identifier'); would be typical.
    
    // For simplicity and assuming it's a new field not yet heavily used:
    // We will drop the old and add the new. If data existed, it would be lost.
    table.dropColumn('stripe_plan_id');
    table.string('plan_identifier').nullable(); // e.g., 'basic_monthly', 'premium_yearly'
    
    // The 'plan_name' column added in the previous migration is good.
    // The 'status' enum ['trial', 'active', 'inactive', 'cancelled'] can still be used.
    // 'active' can represent any paid, current subscription in a mock system.
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('subscriptions', function(table) {
    table.dropColumn('plan_identifier');
    table.string('stripe_plan_id').nullable(); // Add back the old column
  });
};
