const db = require('./db/db');

async function checkAllTables() {
    try {
        console.log('Checking all table schemas...');
        
        // Get all tables
        const tables = await db.all("SELECT name FROM sqlite_master WHERE type='table'");
        console.log('Tables in database:', tables.map(t => t.name).join(', '));
        
        // Check each table's schema
        for (const table of tables) {
            console.log(`\nSchema for table '${table.name}':`);
            const columns = await db.all(`PRAGMA table_info('${table.name}')`);
            columns.forEach(col => {
                console.log(`  ${col.name}: ${col.type} ${col.notnull ? 'NOT NULL' : ''} ${col.pk ? 'PRIMARY KEY' : ''}`);
            });
        }
    } catch (error) {
        console.error('Error checking schemas:', error);
    }
}

checkAllTables(); 