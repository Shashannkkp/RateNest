
const pool = require('../config/db');

// Get Admin dashboard statistics from PostgreSQL
const getDashboardStats = async () => {
    const [statsResult, distributionResult] = await Promise.all([
        pool.query(
            `SELECT
                (SELECT COUNT(*) FROM users)::INTEGER AS total_users,
                (SELECT COUNT(*) FROM stores)::INTEGER AS total_stores,
                (SELECT COUNT(*) FROM ratings)::INTEGER AS total_ratings,
                COALESCE(
                    (SELECT ROUND(AVG(rating)::NUMERIC, 2) FROM ratings),
                    0
                ) AS average_rating`
        ),

        pool.query(
            `SELECT
                rating,
                COUNT(*)::INTEGER AS count
             FROM ratings
             GROUP BY rating
             ORDER BY rating DESC`
        ),
    ]);

    const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => {
        const record = distributionResult.rows.find(
            (row) => row.rating === rating
        );

        return {
            rating,
            count: record ? record.count : 0,
        };
    });

    return {
        ...statsResult.rows[0],
        rating_distribution: ratingDistribution,
    };
};

module.exports = {
    getDashboardStats,
};
