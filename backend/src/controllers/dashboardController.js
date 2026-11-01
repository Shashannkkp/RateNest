
const { getDashboardStats } = require('../models/dashboardModel');

const getDashboard = async (req, res) => {
    try {
        const stats = await getDashboardStats();

        return res.status(200).json({
            success: true,
            message: 'Dashboard statistics retrieved successfully.',
            stats: {
                totalUsers: stats.total_users,
                totalStores: stats.total_stores,
                totalRatings: stats.total_ratings,
                averageRating: Number(stats.average_rating),
            },
            ratingDistribution: stats.rating_distribution,
        });
    } catch (error) {
        console.error('Dashboard statistics error:', error.message);

        return res.status(500).json({
            success: false,
            message: 'Unable to retrieve dashboard statistics.',
        });
    }
};

module.exports = {
    getDashboard,
};
