/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('item_views', function(table) {
    table.increments('id').primary();
    table.integer('menu_item_id').unsigned().notNullable();
    table.integer('visit_id').unsigned().notNullable(); // Foreign key to menu_visits
    table.timestamp('view_timestamp').defaultTo(knex.fn.now());
    // Add other relevant fields, e.g., interaction_type (view, click, etc.) if needed later

    table.foreign('menu_item_id').references('id').inTable('menu_items').onDelete('CASCADE');
    table.foreign('visit_id').references('id').inTable('menu_visits').onDelete('CASCADE');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('item_views');
};
