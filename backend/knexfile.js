require('dotenv').config({ path: require('path').resolve(__dirname, './.env') }); // Load .env relative to knexfile.js

module.exports = {
  development: {
    client: 'mysql2', // Changed client to mysql2
    connection: {
      host: process.env.DB_HOST || '127.0.0.1',
      port: process.env.DB_PORT || 3306, // Default MySQL port
      user: process.env.DB_USER || 'ars', // Common default MySQL user
      password: process.env.DB_PASSWORD || 'ArsTurqa24',
      database: process.env.DB_NAME || 'qrmenu_dev'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: './db/migrations'
    },
    seeds: {
      directory: './db/seeds'
    }
  },

  production: {
    client: 'mysql2', // Changed client to mysql2
    connection: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306, // Default MySQL port
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: './db/migrations'
    }
    // Add seeds directory if needed for production
  }
};
