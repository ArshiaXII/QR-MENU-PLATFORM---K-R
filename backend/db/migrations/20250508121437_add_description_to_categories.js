/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  // Add the 'description' column which was missed when adding multi-language fields
  return knex.schema.alterTable('categories', function(table) {
    table.text('description').nullable(); // Add the default description column
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('categories', function(table) {
    table.dropColumn('description');
  });
};
