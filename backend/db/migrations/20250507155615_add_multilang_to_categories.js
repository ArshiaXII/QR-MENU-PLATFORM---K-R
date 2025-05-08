/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('categories', function(table) {
    // Assuming 'name' is the default/primary language (e.g., English)
    // Add columns for other languages, e.g., Turkish (tr)
    table.string('name_en').nullable(); // Explicit English name
    table.string('description_en').nullable(); // Explicit English description
    
    table.string('name_tr').nullable();
    table.text('description_tr').nullable(); // Use text for potentially longer descriptions

    // Add more languages as needed, e.g.:
    // table.string('name_es').nullable();
    // table.text('description_es').nullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('categories', function(table) {
    table.dropColumn('name_en');
    table.dropColumn('description_en');
    table.dropColumn('name_tr');
    table.dropColumn('description_tr');
    // Drop other language columns if added
    // table.dropColumn('name_es');
    // table.dropColumn('description_es');
  });
};
