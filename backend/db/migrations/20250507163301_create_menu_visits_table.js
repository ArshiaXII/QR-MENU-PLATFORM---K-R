/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('menu_visits', function(table) {
    table.increments('id').primary();
    table.integer('restaurant_id').unsigned().notNullable();
    table.integer('menu_id').unsigned().notNullable();
    table.timestamp('visit_timestamp').defaultTo(knex.fn.now());
    table.string('ip_address_hash').nullable(); // Optional, for de-duplication or basic tracking
    table.text('user_agent').nullable();
    
    table.foreign('restaurant_id').references('id').inTable('restaurants').onDelete('CASCADE');
    table.foreign('menu_id').references('id').inTable('menus').onDelete('CASCADE');
    // No created_at/updated_at needed for this log table usually
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('menu_visits');
};
