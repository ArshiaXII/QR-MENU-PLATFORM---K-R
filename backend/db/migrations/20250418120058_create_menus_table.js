/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('menus', function(table) {
    table.increments('id').primary();
    table.integer('restaurant_id').unsigned().notNullable();
    table.foreign('restaurant_id').references('id').inTable('restaurants').onDelete('CASCADE'); // Link to the restaurant
    table.string('name').notNullable();
    table.text('description');
    table.string('template_id').defaultTo('default'); // Identifier for the chosen menu template/design
    table.timestamps(true, true); // Adds created_at and updated_at
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('menus');
};
