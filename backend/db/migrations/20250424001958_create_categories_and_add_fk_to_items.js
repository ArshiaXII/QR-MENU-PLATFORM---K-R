/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    // 1. Create the categories table
    .createTable('categories', function(table) {
      table.increments('id').primary();
      table.string('name', 255).notNullable();
      table.integer('restaurant_id').unsigned().notNullable();
      table.foreign('restaurant_id').references('id').inTable('restaurants').onDelete('CASCADE'); // Link to restaurant
      table.timestamps(true, true); // Adds created_at and updated_at

      // Optional: Add unique constraint for name within a restaurant
      table.unique(['restaurant_id', 'name']);
    })
    // 2. Add category_id to menu_items table
    .alterTable('menu_items', function(table) {
      table.integer('category_id').unsigned().nullable(); // Allow items without a category initially
      table.foreign('category_id').references('id').inTable('categories').onDelete('SET NULL'); // Set null if category deleted
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema
    // 1. Remove category_id from menu_items first (reverse order of creation)
    .alterTable('menu_items', function(table) {
      // Drop foreign key constraint first (syntax might vary slightly by DB)
      // Knex typically handles this, but being explicit can help
      // For SQLite, dropping constraints is complex, often requires table rebuild.
      // Knex abstracts this, but be aware.
      // Let's assume Knex handles dropping the FK when dropping the column.
      table.dropColumn('category_id');
    })
    // 2. Drop the categories table
    .dropTableIfExists('categories');
};
