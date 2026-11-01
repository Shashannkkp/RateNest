
const pool = require('../config/db');

// Get stores with average ratings and the logged-in user's rating
const getStoresForUser = async (userId, search = '') => {
    const result = await pool.query(
        `SELECT
            stores.id,
            stores.name,
            stores.email,
            stores.address,
            COALESCE(ROUND(AVG(all_ratings.rating), 2), 0) AS average_rating,
            COUNT(all_ratings.id)::INTEGER AS total_ratings,
            user_rating.rating AS my_rating
         FROM stores
         LEFT JOIN ratings AS all_ratings
            ON stores.id = all_ratings.store_id
         LEFT JOIN ratings AS user_rating
            ON stores.id = user_rating.store_id
            AND user_rating.user_id = $1
         WHERE
            stores.name ILIKE $2
            OR stores.address ILIKE $2
         GROUP BY stores.id, user_rating.rating
         ORDER BY stores.name ASC`,
        [userId, `%${search}%`]
    );

    return result.rows;
};

// Get one store's details and the logged-in user's rating
const getStoreForUser = async (storeId, userId) => {
    const result = await pool.query(
        `SELECT
            stores.id,
            stores.name,
            stores.email,
            stores.address,
            COALESCE(ROUND(AVG(all_ratings.rating), 2), 0) AS average_rating,
            COUNT(all_ratings.id)::INTEGER AS total_ratings,
            user_rating.rating AS my_rating
         FROM stores
         LEFT JOIN ratings AS all_ratings
            ON stores.id = all_ratings.store_id
         LEFT JOIN ratings AS user_rating
            ON stores.id = user_rating.store_id
            AND user_rating.user_id = $2
         WHERE stores.id = $1
         GROUP BY stores.id, user_rating.rating`,
        [storeId, userId]
    );

    return result.rows[0];
};

module.exports = {
    getStoresForUser,
    getStoreForUser,
};
