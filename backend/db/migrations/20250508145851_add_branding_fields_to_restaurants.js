/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('restaurants', function(table) {
    // Flag to allow removing "Powered by..." footer (likely a premium feature)
    table.boolean('allow_remove_branding').notNullable().defaultTo(false);
    // Custom text to display in the footer instead of/in addition to default
    table.text('custom_footer_text').nullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('restaurants', function(table) {
    table.dropColumn('allow_remove_branding');
    table.dropColumn('custom_footer_text');
  });
};
