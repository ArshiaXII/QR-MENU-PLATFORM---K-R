/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('menu_items', function(table) {
    // Assuming 'name' and 'description' are default/primary language (e.g., English)
    table.string('name_en').nullable();
    table.text('description_en').nullable();
    
    table.string('name_tr').nullable();
    table.text('description_tr').nullable();

    // Add more languages as needed
    // table.string('name_es').nullable();
    // table.text('description_es').nullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('menu_items', function(table) {
    table.dropColumn('name_en');
    table.dropColumn('description_en');
    table.dropColumn('name_tr');
    table.dropColumn('description_tr');
    // Drop other language columns if added
    // table.dropColumn('name_es');
    // table.dropColumn('description_es');
  });
};
