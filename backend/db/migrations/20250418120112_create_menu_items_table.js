/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('menu_items', function(table) {
    table.increments('id').primary();
    table.integer('menu_id').unsigned().notNullable();
    table.foreign('menu_id').references('id').inTable('menus').onDelete('CASCADE'); // Link to the menu
    table.string('name').notNullable();
    table.text('description');
    table.decimal('price', 10, 2).notNullable(); // Price with precision
    table.string('image_path'); // Path to the uploaded item image
    table.timestamps(true, true); // Adds created_at and updated_at
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('menu_items');
};
