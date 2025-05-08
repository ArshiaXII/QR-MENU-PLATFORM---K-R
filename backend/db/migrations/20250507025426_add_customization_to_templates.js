/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('templates', function(table) {
    // Add customization_settings column to store JSON data
    // For SQLite, Knex uses TEXT and handles JSON stringification/parsing.
    // For PostgreSQL, use .jsonb() for better performance.
    // For MySQL, use .json().
    if (knex.client.config.client === 'sqlite3') {
      table.text('customization_settings').nullable();
    } else {
      table.json('customization_settings').nullable();
    }
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('templates', function(table) {
    table.dropColumn('customization_settings');
  });
};
