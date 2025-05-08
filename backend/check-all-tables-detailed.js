const db = require('./db/db');

async function checkAllTablesDetailed() {
    try {
        console.log('Checking all table schemas in detail...');
        
        // Get all tables
        const tables = await db.all("SELECT name FROM sqlite_master WHERE type='table'");
        console.log('Tables in database:', tables.map(t => t.name).join(', '));
        
        // Check each table's schema
        for (const table of tables) {
            console.log(`\nSchema for table '${table.name}':`);
            const columns = await db.all(`PRAGMA table_info('${table.name}')`);
            columns.forEach(col => {
                console.log(`  ${col.cid}: ${col.name} (${col.type}) ${col.notnull ? 'NOT NULL' : ''} ${col.pk ? 'PRIMARY KEY' : ''} Default: ${col.dflt_value || 'NULL'}`);
            });
            
            // Also check for any records in the table
            try {
                const count = await db.get(`SELECT COUNT(*) as count FROM ${table.name}`);
                console.log(`  Records in table: ${count.count}`);
                
                if (count.count > 0) {
                    // Show sample records
                    const records = await db.all(`SELECT * FROM ${table.name} LIMIT 2`);
                    console.log('  Sample records:');
                    records.forEach((record, i) => {
                        console.log(`    Record ${i + 1}:`, record);
                    });
                }
            } catch (error) {
                console.error(`  Error querying table ${table.name}:`, error.message);
            }
        }
    } catch (error) {
        console.error('Error checking schemas:', error);
    }
}

checkAllTablesDetailed(); 