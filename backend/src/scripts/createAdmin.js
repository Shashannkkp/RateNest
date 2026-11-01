
require('dotenv').config();

const bcrypt = require('bcrypt');
const pool = require('../config/db');

const createAdmin = async () => {
    try {
        const {
            ADMIN_NAME,
            ADMIN_EMAIL,
            ADMIN_PASSWORD,
            ADMIN_ADDRESS,
        } = process.env;

        if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD || !ADMIN_ADDRESS) {
            throw new Error('Admin details are missing from the .env file.');
        }

        if (ADMIN_NAME.trim().length < 20 || ADMIN_NAME.trim().length > 60) {
            throw new Error('Admin name must be between 20 and 60 characters.');
        }

        const passwordRegex = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/;

        if (!passwordRegex.test(ADMIN_PASSWORD)) {
            throw new Error(
                'Admin password must be 8-16 characters with an uppercase letter and a special character.'
            );
        }

        const existingAdmin = await pool.query(
            'SELECT id FROM users WHERE email = $1',
            [ADMIN_EMAIL.trim().toLowerCase()]
        );

        if (existingAdmin.rows.length > 0) {
            throw new Error('An account with this email already exists.');
        }

        const roleResult = await pool.query(
            'SELECT id FROM roles WHERE name = $1',
            ['ADMIN']
        );

        if (roleResult.rows.length === 0) {
            throw new Error('ADMIN role is not configured in the database.');
        }

        const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);

        const result = await pool.query(
            `INSERT INTO users (name, email, password, address, role_id)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id, name, email`,
            [
                ADMIN_NAME.trim(),
                ADMIN_EMAIL.trim().toLowerCase(),
                hashedPassword,
                ADMIN_ADDRESS.trim(),
                roleResult.rows[0].id,
            ]
        );

        console.log('Admin account created successfully.');
        console.log('Admin details:', result.rows[0]);

    } catch (error) {
        console.error('Admin creation failed:', error.message);
        process.exitCode = 1;
    } finally {
        await pool.end();
    }
};

createAdmin();
