
const pool = require('../config/db');

// Find a user by email, including their role
const findUserByEmail = async (email) => {
    const result = await pool.query(
        `SELECT
            users.id,
            users.name,
            users.email,
            users.password,
            users.address,
            users.role_id,
            roles.name AS role
         FROM users
         INNER JOIN roles ON users.role_id = roles.id
         WHERE users.email = $1`,
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


// Update a user's password
const updateUserPassword = async (userId, hashedPassword) => {
    const result = await pool.query(
        `UPDATE users
         SET password = $1
         WHERE id = $2
         RETURNING id`,
        [hashedPassword, userId]
    );

    return result.rows[0];
};


module.exports = {
    findUserByEmail,
    createUser,
    updateUserPassword,
};
