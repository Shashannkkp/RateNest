
require('dotenv').config();

const { Pool } = require('pg');

const requiredVariables = [
    'DB_USER',
    'DB_HOST',
    'DB_NAME',
    'DB_PASSWORD',
];

const missingVariables = requiredVariables.filter(
    (variable) => !process.env[variable]
);

if (missingVariables.length > 0) {
    throw new Error(
        `Missing database environment variables: ${missingVariables.join(', ')}`
    );
}

const databasePort = Number(process.env.DB_PORT || 5432);

if (!Number.isInteger(databasePort) || databasePort < 1 || databasePort > 65535) {
    throw new Error('Invalid DB_PORT in the .env file.');
}

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: databasePort,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
    ssl: process.env.DB_SSL === 'true'
        ? {
            rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false',
        }
        : false,
});

pool.on('connect', () => {
    console.log('Connected to PostgreSQL database.');
});

pool.on('error', (error) => {
    console.error('Unexpected PostgreSQL connection error:', error.message);
});

module.exports = pool;
