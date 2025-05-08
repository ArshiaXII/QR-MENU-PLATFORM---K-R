/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('images', function(table) {
    table.increments('id').primary();
    table.integer('user_id').unsigned().nullable(); // Made nullable because of onDelete('SET NULL')
    table.foreign('user_id').references('id').inTable('users').onDelete('SET NULL'); // Keep image record even if user is deleted? Or CASCADE? Let's use SET NULL for now.
    table.string('file_path').notNullable().unique(); // Unique path on the storage system
    table.string('original_name').notNullable(); // Original name of the uploaded file
    table.string('mime_type').notNullable(); // e.g., 'image/png', 'image/jpeg'
    table.integer('size').unsigned().notNullable(); // File size in bytes
    // We won't add related_to/related_id here. Instead, other tables will reference the file_path.
    // This makes the images table more generic.
    table.timestamps(true, true); // Adds created_at and updated_at
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('images');
};
