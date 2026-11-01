const pool = require('../config/db');

const getAllUsers = async ({
    search,
    role,
    sortBy,
    order,
    limit,
    offset,
}) => {
    const allowedSortColumns = {
        name: 'users.name',
        email: 'users.email',
        role: 'roles.name',
        created_at: 'users.created_at',
    };

    const sortColumn = allowedSortColumns[sortBy] || 'users.created_at';
    const sortOrder = order === 'asc' ? 'ASC' : 'DESC';

    const result = await pool.query(
        `SELECT
            users.id,
            users.name,
            users.email,
            users.address,
            users.role_id,
            roles.name AS role,
            users.created_at
         FROM users
         INNER JOIN roles ON users.role_id = roles.id
         WHERE
            ($1 = '' OR users.name ILIKE $1 OR users.email ILIKE $1)
            AND ($2 = '' OR roles.name = $2)
         ORDER BY ${sortColumn} ${sortOrder}, users.id ASC
         LIMIT $3 OFFSET $4`,
        [
            search ? `%${search}%` : '',
            role || '',
            limit,
            offset,
        ]
    );

    return result.rows;
};

const countUsers = async ({ search, role }) => {
    const result = await pool.query(
        `SELECT COUNT(*)::INTEGER AS total
         FROM users
         INNER JOIN roles ON users.role_id = roles.id
         WHERE
            ($1 = '' OR users.name ILIKE $1 OR users.email ILIKE $1)
            AND ($2 = '' OR roles.name = $2)`,
        [
            search ? `%${search}%` : '',
            role || '',
        ]
    );

    return result.rows[0].total;
};

const getUserById = async (userId) => {
    const result = await pool.query(
        `SELECT
            users.id,
            users.name,
            users.email,
            users.address,
            roles.name AS role,
            users.created_at,
            stores.id AS store_id,
            stores.name AS store_name,
            COALESCE(ROUND(AVG(ratings.rating), 2), 0) AS store_average_rating,
            COUNT(ratings.id)::INTEGER AS store_total_ratings
         FROM users
         INNER JOIN roles
            ON users.role_id = roles.id
         LEFT JOIN stores
            ON stores.owner_id = users.id
         LEFT JOIN ratings
            ON ratings.store_id = stores.id
         WHERE users.id = $1
         GROUP BY users.id, roles.name, stores.id`,
        [userId]
    );

    return result.rows[0];
};

const createUserByAdmin = async (userData) => {
    const {
        name,
        email,
        password,
        address,
        roleId,
        storeId,
    } = userData;

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const result = await client.query(
            `INSERT INTO users (name, email, password, address, role_id)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id, name, email, address, role_id, created_at`,
            [name, email, password, address, roleId]
        );

        const user = result.rows[0];

        if (storeId) {
            const storeResult = await client.query(
                `UPDATE stores
                 SET owner_id = $1
                 WHERE id = $2
                   AND owner_id IS NULL
                 RETURNING id, name, owner_id`,
                [user.id, storeId]
            );

            if (storeResult.rows.length === 0) {
                const existingStore = await client.query(
                    'SELECT id FROM stores WHERE id = $1',
                    [storeId]
                );

                const error = new Error(
                    existingStore.rows.length === 0
                        ? 'Selected store does not exist.'
                        : 'Selected store already has an owner.'
                );

                error.code = existingStore.rows.length === 0
                    ? 'STORE_NOT_FOUND'
                    : 'STORE_ALREADY_ASSIGNED';

                throw error;
            }

            user.store_id = storeResult.rows[0].id;
            user.store_name = storeResult.rows[0].name;
        }

        await client.query('COMMIT');

        return user;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

const assignStoreOwner = async (storeId, ownerId) => {
    const result = await pool.query(
        `UPDATE stores
         SET owner_id = $1
         WHERE id = $2
         RETURNING id, name, owner_id`,
        [ownerId, storeId]
    );

    return result.rows[0];
};

module.exports = {
    getAllUsers,
    countUsers,
    getUserById,
    createUserByAdmin,
    assignStoreOwner,
};