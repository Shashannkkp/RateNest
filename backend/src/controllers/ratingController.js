
const {
    saveRating,
    getUserRating,
} = require('../models/ratingModel');

const pool = require('../config/db');

const submitRating = async (req, res) => {
    try {
        const storeId = Number(req.params.storeId);
        const { rating } = req.body || {};

        if (!Number.isInteger(storeId) || storeId <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid store ID.',
            });
        }

        if (
            typeof rating !== 'number' ||
            !Number.isInteger(rating) ||
            rating < 1 ||
            rating > 5
        ) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be a whole number between 1 and 5.',
            });
        }

        const storeResult = await pool.query(
            'SELECT id FROM stores WHERE id = $1',
            [storeId]
        );

        if (storeResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Store not found.',
            });
        }

        const savedRating = await saveRating(
            req.user.userId,
            storeId,
            rating
        );

        return res.status(200).json({
            success: true,
            message: 'Rating submitted successfully.',
            rating: savedRating,
        });
    } catch (error) {
        console.error('Submit rating error:', error.message);

        return res.status(500).json({
            success: false,
            message: 'Unable to submit rating.',
        });
    }
};

const getMyRating = async (req, res) => {
    try {
        const storeId = Number(req.params.storeId);

        if (!Number.isInteger(storeId) || storeId <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid store ID.',
            });
        }

        const storeResult = await pool.query(
            'SELECT id FROM stores WHERE id = $1',
            [storeId]
        );

        if (storeResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Store not found.',
            });
        }

        const savedRating = await getUserRating(
            req.user.userId,
            storeId
        );

        return res.status(200).json({
            success: true,
            rating: savedRating || null,
        });
    } catch (error) {
        console.error('Get my rating error:', error.message);

        return res.status(500).json({
            success: false,
            message: 'Unable to retrieve your rating.',
        });
    }
};

module.exports = {
    submitRating,
    getMyRating,
};
