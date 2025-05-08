const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Path to the database file
const dbPath = path.join(__dirname, 'backend', 'data', 'qrmenu.db');
console.log('Checking database at:', dbPath);

// Connect to the database
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
    if (err) {
        console.error('Error connecting to database:', err.message);
        return;
    }
    console.log('Connected to the database');
    
    // Get list of tables
    db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
        if (err) {
            console.error('Error getting tables:', err.message);
            return;
        }
        
        console.log('Tables in database:');
        tables.forEach(table => {
            console.log(`- ${table.name}`);
            
            // Get schema for each table
            db.all(`PRAGMA table_info(${table.name})`, (err, columns) => {
                if (err) {
                    console.error(`Error getting schema for table ${table.name}:`, err.message);
                    return;
                }
                
                console.log(`  Columns in ${table.name}:`);
                columns.forEach(column => {
                    console.log(`    - ${column.name} (${column.type})`);
                });
                console.log('');
            });
        });
    });
}); 