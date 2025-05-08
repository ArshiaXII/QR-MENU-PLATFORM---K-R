/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('menu_items', function(table) {
    // Add is_available column, defaulting to true (or 1 for boolean)
    table.boolean('is_available').notNullable().defaultTo(true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('menu_items', function(table) {
    table.dropColumn('is_available');
  });
};
