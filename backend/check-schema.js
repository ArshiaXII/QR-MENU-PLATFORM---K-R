const db = require('./db/db'); // Use the Knex instance from db.js

async function checkTableSchema(tableName) {
  try {
    const exists = await db.schema.hasTable(tableName);
    if (!exists) {
      console.log(`Table '${tableName}' does not exist.`);
      return;
    }

    console.log(`\nChecking schema for table: '${tableName}'...`);
    const columns = await db.table(tableName).columnInfo();
    console.log(`Columns in '${tableName}':`);
    for (const columnName in columns) {
      const info = columns[columnName];
      console.log(`  - ${columnName}:`);
      console.log(`      Type: ${info.type}`);
      console.log(`      Nullable: ${info.nullable}`);
      console.log(`      Default Value: ${info.defaultValue}`);
      // Note: Primary key, foreign key, unique constraints are not directly available via columnInfo()
      // More complex checks would require querying information_schema directly.
    }
  } catch (error) {
    console.error(`Error checking schema for table '${tableName}':`, error);
  }
}

async function checkAllSchemas() {
  console.log('Starting database schema check...');
  const tablesToCheck = [
    'users',
    'restaurants',
    'menus',
    'menu_items',
    'images',
    'subscriptions',
    'analytics_logs',
    'knex_migrations', // Also check the migration tracking tables
    'knex_migrations_lock'
  ];

  for (const tableName of tablesToCheck) {
    await checkTableSchema(tableName);
  }

  console.log('\nSchema check finished.');
  // Close the database connection when done
  await db.destroy();
}

checkAllSchemas();