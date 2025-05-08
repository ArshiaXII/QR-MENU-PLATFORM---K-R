/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('users', function(table) {
    table.increments('id').primary(); // Auto-incrementing primary key
    table.string('email').notNullable().unique(); // User's email, must be unique
    table.string('password_hash').notNullable(); // Hashed password
    table.string('role').notNullable().defaultTo('owner'); // User role ('owner', 'admin')
    table.timestamps(true, true); // Adds created_at and updated_at columns
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('users');
};
