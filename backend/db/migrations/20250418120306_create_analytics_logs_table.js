/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('analytics_logs', function(table) {
    table.increments('id').primary();
    table.enum('event_type', ['menu_view', 'item_view']).notNullable(); // Type of event logged
    table.integer('restaurant_id').unsigned().notNullable();
    table.foreign('restaurant_id').references('id').inTable('restaurants').onDelete('CASCADE');
    table.integer('menu_id').unsigned(); // Nullable if not directly related to a menu
    table.foreign('menu_id').references('id').inTable('menus').onDelete('CASCADE');
    table.integer('menu_item_id').unsigned(); // Nullable if not related to a specific item
    table.foreign('menu_item_id').references('id').inTable('menu_items').onDelete('CASCADE');
    table.timestamp('timestamp').defaultTo(knex.fn.now()); // Time of the event
    table.string('ip_address'); // Optional: IP address of the visitor
    table.text('user_agent'); // Optional: User agent string of the visitor
    // No created_at/updated_at needed here, timestamp serves the purpose
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('analytics_logs');
};
