
const {
    getOwnerStore,
    getStoreRatings,
} = require('../models/ownerModel');

const getOwnerDashboard = async (req, res) => {
    try {
        const store = await getOwnerStore(req.user.userId);

        if (!store) {
            return res.status(404).json({
                success: false,
                message: 'No store has been assigned to your account.',
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Store dashboard retrieved successfully.',
            store,
        });
    } catch (error) {
        console.error('Store Owner dashboard error:', error.message);

        return res.status(500).json({
            success: false,
            message: 'Unable to retrieve store dashboard.',
        });
    }
};

const getOwnerRatings = async (req, res) => {
    try {
        const store = await getOwnerStore(req.user.userId);

        if (!store) {
            return res.status(404).json({
                success: false,
                message: 'No store has been assigned to your account.',
            });
        }

        const ratings = await getStoreRatings(req.user.userId);

        return res.status(200).json({
            success: true,
            count: ratings.length,
            ratings,
        });
    } catch (error) {
        console.error('Store Owner ratings error:', error.message);

        return res.status(500).json({
            success: false,
            message: 'Unable to retrieve store ratings.',
        });
    }
};

module.exports = {
    getOwnerDashboard,
    getOwnerRatings,
};
