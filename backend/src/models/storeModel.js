
const pool = require('../config/db');

const createStore = async (storeData) => {
    const { name, email, address } = storeData;

    const result = await pool.query(
        `INSERT INTO stores (name, email, address)
         VALUES ($1, $2, $3)
         RETURNING id, name, email, address, owner_id, created_at`,
        [name, email, address]
    );

    return result.rows[0];
};

const getAllStores = async ({
    search,
    sortBy,
    order,
    limit,
    offset,
}) => {
    const allowedSortColumns = {
        name: 'stores.name',
        email: 'stores.email',
        address: 'stores.address',
        average_rating: 'average_rating',
        created_at: 'stores.created_at',
    };

    const sortColumn =
        allowedSortColumns[sortBy] || 'stores.created_at';

    const sortOrder = order === 'asc' ? 'ASC' : 'DESC';

    const result = await pool.query(
        `SELECT
            stores.id,
            stores.name,
            stores.email,
            stores.address,
            stores.owner_id,
            owner.name AS owner_name,
            COALESCE(ROUND(AVG(ratings.rating), 2), 0) AS average_rating,
            COUNT(ratings.id)::INTEGER AS total_ratings,
            stores.created_at
         FROM stores
         LEFT JOIN users AS owner
            ON stores.owner_id = owner.id
         LEFT JOIN ratings
            ON stores.id = ratings.store_id
         WHERE
            ($1 = '' OR
                stores.name ILIKE $1 OR
                stores.email ILIKE $1 OR
                stores.address ILIKE $1)
         GROUP BY stores.id, owner.name
         ORDER BY ${sortColumn} ${sortOrder}, stores.id DESC
         LIMIT $2 OFFSET $3`,
        [
            search ? `%${search}%` : '',
            limit,
            offset,
        ]
    );

    return result.rows;
};

const countStores = async (search = '') => {
    const result = await pool.query(
        `SELECT COUNT(*)::INTEGER AS total
         FROM stores
         WHERE
            ($1 = '' OR
                name ILIKE $1 OR
                email ILIKE $1 OR
                address ILIKE $1)`,
        [search ? `%${search}%` : '']
    );

    return result.rows[0].total;
};

const getStoreById = async (storeId) => {
    const result = await pool.query(
        `SELECT
            stores.id,
            stores.name,
            stores.email,
            stores.address,
            stores.owner_id,
            owner.name AS owner_name,
            COALESCE(ROUND(AVG(ratings.rating), 2), 0) AS average_rating,
            COUNT(ratings.id)::INTEGER AS total_ratings,
            stores.created_at
         FROM stores
         LEFT JOIN users AS owner
            ON stores.owner_id = owner.id
         LEFT JOIN ratings
            ON stores.id = ratings.store_id
         WHERE stores.id = $1
         GROUP BY stores.id, owner.name`,
        [storeId]
    );

    return result.rows[0];
};

module.exports = {
    createStore,
    getAllStores,
    countStores,
    getStoreById,
};
