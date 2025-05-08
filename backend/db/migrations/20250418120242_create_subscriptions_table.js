/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('subscriptions', function(table) {
    table.increments('id').primary();
    table.integer('restaurant_id').unsigned().notNullable().unique(); // Each restaurant has one subscription record
    table.foreign('restaurant_id').references('id').inTable('restaurants').onDelete('CASCADE');
    table.enum('status', ['trial', 'active', 'inactive', 'cancelled']).notNullable().defaultTo('trial');
    table.timestamp('start_date').defaultTo(knex.fn.now()); // When the subscription period started
    table.timestamp('end_date'); // When the current subscription period ends (null for trial?)
    table.timestamps(true, true); // Adds created_at and updated_at
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('subscriptions');
};
