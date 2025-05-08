/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('restaurants', function(table) {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable(); // Foreign key to users table
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE'); // Link to the owner user, cascade delete
    table.string('name').notNullable();
    table.text('description');
    table.string('logo_path'); // Path to the uploaded logo file
    table.timestamps(true, true); // Adds created_at and updated_at
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('restaurants');
};
