
const pool = require('../config/db');

const findUserByEmail = async (email) => {
    const result = await pool.query(
        `SELECT
            users.id,
            users.name,
            users.email,
            users.password,
            users.address,
            users.role_id,
            users.token_version,
            roles.name AS role
         FROM users
         INNER JOIN roles ON users.role_id = roles.id
         WHERE users.email = $1`,
        [email]
    );

    return result.rows[0];
};

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

const updateUserPassword = async (userId, hashedPassword) => {
    const result = await pool.query(
        `UPDATE users
         SET password = $1,
             token_version = token_version + 1
         WHERE id = $2
         RETURNING id, token_version`,
        [hashedPassword, userId]
    );

    return result.rows[0];
};

const findUserById = async (userId) => {
    const result = await pool.query(
        `SELECT id, password, token_version
         FROM users
         WHERE id = $1`,
        [userId]
    );

    return result.rows[0];
};

const getUserTokenVersion = async (userId) => {
    const result = await pool.query(
        `SELECT token_version
         FROM users
         WHERE id = $1`,
        [userId]
    );

    return result.rows[0];
};

module.exports = {
    findUserByEmail,
    findUserById,
    createUser,
    updateUserPassword,
    getUserTokenVersion,
};
