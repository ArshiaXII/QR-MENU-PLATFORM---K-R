const knex = require('knex');
const knexConfig = require('../knexfile');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') }); // Explicit path relative to db.js

// Determine the environment, default to 'development'
const environment = process.env.NODE_ENV || 'development';

let config = knexConfig[environment];

if (!config) {
  throw new Error(`Knex configuration not found for environment: ${environment}`);
}

// Manually override connection details with environment variables AFTER loading base config
// This ensures .env values take precedence if they exist
config = {
  ...config, // Spread the base config (client, migrations, pool, etc.)
  connection: {
    ...(config.connection || {}), // Spread base connection defaults first
    host: process.env.DB_HOST || config.connection?.host || '127.0.0.1',
    port: process.env.DB_PORT || config.connection?.port || 3306,
    user: process.env.DB_USER || config.connection?.user, // Let it be undefined if not in .env or base config
    password: process.env.DB_PASSWORD || config.connection?.password,
    database: process.env.DB_NAME || config.connection?.database,
  }
};

// Log the final config being used (optional, for debugging)
// console.log(`[db.js] Using final Knex config for [${environment}]:`, JSON.stringify(config, null, 2));

// Initialize Knex with the potentially overridden config
const db = knex(config);

// Optional: Test the connection (SELECT 1+1 works on MySQL too)
db.raw('SELECT 1+1 AS result').then(() => {
  console.log(`Successfully connected to MySQL database using [${environment}] environment.`);
}).catch((err) => {
  console.error(`Failed to connect to MySQL database using [${environment}] environment:`, err);
  // Optionally exit the process if connection fails on startup
  // process.exit(1);
});

module.exports = db;