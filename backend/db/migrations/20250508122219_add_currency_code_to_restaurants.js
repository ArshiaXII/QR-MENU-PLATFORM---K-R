/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('restaurants', function(table) {
    // Add currency_code column, defaulting to 'USD'
    // Using a short string, e.g., 3 characters for ISO 4217 codes
    table.string('currency_code', 3).notNullable().defaultTo('USD'); 
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('restaurants', function(table) {
    table.dropColumn('currency_code');
  });
};
