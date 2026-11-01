
const pool = require('../config/db');

const getAllRatings = async ({
    search,
    rating,
    sortBy,
    order,
    limit,
    offset,
}) => {
    const allowedSortColumns = {
        rating: 'ratings.rating',
        user_name: 'users.name',
        store_name: 'stores.name',
        created_at: 'ratings.created_at',
        updated_at: 'ratings.updated_at',
    };

    const sortColumn =
        allowedSortColumns[sortBy] || 'ratings.created_at';

    const sortOrder = order === 'asc' ? 'ASC' : 'DESC';

    const result = await pool.query(
        `SELECT
            ratings.id,
            ratings.rating,
            ratings.created_at,
            ratings.updated_at,
            users.id AS user_id,
            users.name AS user_name,
            users.email AS user_email,
            stores.id AS store_id,
            stores.name AS store_name
         FROM ratings
         INNER JOIN users ON ratings.user_id = users.id
         INNER JOIN stores ON ratings.store_id = stores.id
         WHERE
            ($1 = '' OR
                users.name ILIKE $1 OR
                users.email ILIKE $1 OR
                stores.name ILIKE $1)
            AND ($2::INTEGER IS NULL OR ratings.rating = $2)
         ORDER BY ${sortColumn} ${sortOrder}, ratings.id DESC
         LIMIT $3 OFFSET $4`,
        [
            search ? `%${search}%` : '',
            rating ?? null,
            limit,
            offset,
        ]
    );

    return result.rows;
};

const countRatings = async (search = '', rating = null) => {
    const result = await pool.query(
        `SELECT COUNT(*)::INTEGER AS total
         FROM ratings
         INNER JOIN users ON ratings.user_id = users.id
         INNER JOIN stores ON ratings.store_id = stores.id
         WHERE
            ($1 = '' OR
                users.name ILIKE $1 OR
                users.email ILIKE $1 OR
                stores.name ILIKE $1)
            AND ($2::INTEGER IS NULL OR ratings.rating = $2)`,
        [
            search ? `%${search}%` : '',
            rating,
        ]
    );

    return result.rows[0].total;
};

module.exports = {
    getAllRatings,
    countRatings,
};
