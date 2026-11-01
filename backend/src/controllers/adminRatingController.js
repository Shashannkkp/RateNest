
const {
    getAllRatings,
    countRatings,
} = require('../models/adminRatingModel');

const getRatings = async (req, res) => {
    try {
        const search =
            typeof req.query.search === 'string'
                ? req.query.search.trim()
                : '';

        const sortBy =
            typeof req.query.sortBy === 'string'
                ? req.query.sortBy
                : 'created_at';

        const order =
            typeof req.query.order === 'string'
                ? req.query.order.toLowerCase()
                : 'desc';

        const page = Number(req.query.page ?? 1);
        const limit = Number(req.query.limit ?? 10);

        const rating =
            req.query.rating === undefined || req.query.rating === ''
                ? null
                : Number(req.query.rating);

        if (
            !Number.isInteger(page) ||
            page < 1 ||
            !Number.isInteger(limit) ||
            limit < 1 ||
            limit > 100
        ) {
            return res.status(400).json({
                success: false,
                message: 'Invalid pagination values.',
            });
        }

        if (search.length > 100) {
            return res.status(400).json({
                success: false,
                message: 'Search must not exceed 100 characters.',
            });
        }

        if (
            rating !== null &&
            (!Number.isInteger(rating) || rating < 1 || rating > 5)
        ) {
            return res.status(400).json({
                success: false,
                message: 'Rating filter must be between 1 and 5.',
            });
        }

        const allowedSortFields = [
            'rating',
            'user_name',
            'store_name',
            'created_at',
            'updated_at',
        ];

        if (!allowedSortFields.includes(sortBy)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid sort field.',
            });
        }

        if (!['asc', 'desc'].includes(order)) {
            return res.status(400).json({
                success: false,
                message: 'Sort order must be asc or desc.',
            });
        }

        const offset = (page - 1) * limit;

        const [ratings, totalRatings] = await Promise.all([
            getAllRatings({
                search,
                rating,
                sortBy,
                order,
                limit,
                offset,
            }),
            countRatings(search, rating),
        ]);

        return res.status(200).json({
            success: true,
            ratings,
            pagination: {
                totalRatings,
                currentPage: page,
                totalPages: Math.ceil(totalRatings / limit),
                limit,
            },
        });
    } catch (error) {
        console.error('Get ratings error:', error.message);

        return res.status(500).json({
            success: false,
            message: 'Unable to retrieve ratings.',
        });
    }
};

module.exports = {
    getRatings,
};
