/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('templates', function(table) {
    table.increments('id').primary();
    table.integer('restaurant_id').unsigned().nullable(); // Changed to nullable
    table.string('name').notNullable();
    table.string('background_color').defaultTo('#FFFFFF');
    table.string('text_color').defaultTo('#000000');
    table.string('accent_color').defaultTo('#4A90E2');
    table.string('font_family').defaultTo('Arial, sans-serif');
    table.string('header_text').defaultTo('Restaurant Menu');
    table.string('layout_type').defaultTo('grid'); // e.g., 'grid', 'list'
    table.string('logo_url').nullable();
    table.boolean('is_active').defaultTo(false);
    table.timestamps(true, true); // Adds created_at and updated_at

    // Foreign key constraint (Corrected to reference restaurants table)
    table.foreign('restaurant_id').references('id').inTable('restaurants').onDelete('CASCADE');

    // Optional: Add unique constraint for name per restaurant if needed
    // table.unique(['restaurant_id', 'name']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('templates');
};
