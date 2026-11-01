
const pool = require('../config/db');

// Find an existing user by email
const findUserByEmail = async (email) => {
    const result = await pool.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
    );

    return result.rows[0];
};

// Create a new user
const createUser = async (userData) => {
    const { name, email, password, address, roleId } = userData;

    const result = await pool.query(
        `INSERT INTO users (name, email, password, address, role_id)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, name, email, address, role_id, created_at`,
        [name, email, password, address, roleId]
    );

    return result.rows[0];
};

module.exports = {
    findUserByEmail,
    createUser,
};
