/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('restaurants', function(table) {
    // Add slug column, make it unique and nullable initially
    // Nullable allows existing rows to be updated before enforcing notNullable
    table.string('slug').unique().nullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('restaurants', function(table) {
    table.dropColumn('slug');
  });
};
