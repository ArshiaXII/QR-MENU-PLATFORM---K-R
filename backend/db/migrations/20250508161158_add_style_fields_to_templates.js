/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('templates', function(table) {
    // Controls overall item layout (already exists, but ensure it's there)
    // table.string('layout_type').defaultTo('grid'); // Already added in 20250507025426

    // Specific styling options
    table.string('item_card_style').defaultTo('default'); // e.g., 'default', 'image-top', 'minimal'
    table.string('category_header_style').defaultTo('default'); // e.g., 'default', 'image-bg', 'simple-underlined'
    table.boolean('show_category_images').defaultTo(true); 
    // Add more fields as needed: e.g., button_style, image_aspect_ratio etc.
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('templates', function(table) {
    table.dropColumn('item_card_style');
    table.dropColumn('category_header_style');
    table.dropColumn('show_category_images');
    // Drop other added columns
  });
};
