
const pool = require('../config/db');

const getOwnerStore = async (ownerId) => {
    const result = await pool.query(
        `SELECT
            stores.id,
            stores.name,
            stores.email,
            stores.address,
            COALESCE(ROUND(AVG(ratings.rating), 2), 0) AS average_rating,
            COUNT(ratings.id)::INTEGER AS total_ratings,

            COUNT(ratings.id) FILTER (
                WHERE ratings.rating = 5
            )::INTEGER AS five_star_ratings,

            COUNT(ratings.id) FILTER (
                WHERE ratings.rating = 4
            )::INTEGER AS four_star_ratings,

            COUNT(ratings.id) FILTER (
                WHERE ratings.rating = 3
            )::INTEGER AS three_star_ratings,

            COUNT(ratings.id) FILTER (
                WHERE ratings.rating = 2
            )::INTEGER AS two_star_ratings,

            COUNT(ratings.id) FILTER (
                WHERE ratings.rating = 1
            )::INTEGER AS one_star_ratings

         FROM stores
         LEFT JOIN ratings
            ON stores.id = ratings.store_id
         WHERE stores.owner_id = $1
         GROUP BY stores.id`,
        [ownerId]
    );

    return result.rows[0];
};

const getStoreRatings = async (ownerId) => {
    const result = await pool.query(
        `SELECT
            users.id AS user_id,
            users.name AS user_name,
            users.email AS user_email,
            ratings.rating,
            ratings.created_at,
            ratings.updated_at
         FROM stores
         INNER JOIN ratings
            ON stores.id = ratings.store_id
         INNER JOIN users
            ON ratings.user_id = users.id
         WHERE stores.owner_id = $1
         ORDER BY ratings.updated_at DESC`,
        [ownerId]
    );

    return result.rows;
};

module.exports = {
    getOwnerStore,
    getStoreRatings,
};
