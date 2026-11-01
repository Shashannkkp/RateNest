
const {
    createStore,
    getAllStores,
    countStores,
    getStoreById,
} = require('../models/storeModel');

const addStore = async (req, res) => {
    try {
        const { name, email, address } = req.body || {};

        if (
            typeof name !== 'string' ||
            name.trim().length === 0 ||
            name.trim().length > 100
        ) {
            return res.status(400).json({
                success: false,
                message: 'Store name is required and must not exceed 100 characters.',
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (
            typeof email !== 'string' ||
            !emailRegex.test(email.trim())
        ) {
            return res.status(400).json({
                success: false,
                message: 'Please enter a valid store email address.',
            });
        }

        if (
            typeof address !== 'string' ||
            address.trim().length === 0 ||
            address.trim().length > 400
        ) {
            return res.status(400).json({
                success: false,
                message: 'Store address is required and must not exceed 400 characters.',
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const store = await createStore({
            name: name.trim(),
            email: normalizedEmail,
            address: address.trim(),
        });

        return res.status(201).json({
            success: true,
            message: 'Store created successfully.',
            store,
        });
    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({
                success: false,
                message: 'A store with this email already exists.',
            });
        }

        console.error('Create store error:', error.message);

        return res.status(500).json({
            success: false,
            message: 'Unable to create store.',
        });
    }
};

const getStores = async (req, res) => {
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

        if (
            !Number.isInteger(page) ||
            page < 1 ||
            !Number.isInteger(limit) ||
            limit < 1 ||
            limit > 100
        ) {
            return res.status(400).json({
                success: false,
                message: 'Page must be positive and limit must be between 1 and 100.',
            });
        }

        if (search.length > 100) {
            return res.status(400).json({
                success: false,
                message: 'Search must not exceed 100 characters.',
            });
        }

        const allowedSortFields = [
            'name',
            'email',
            'address',
            'average_rating',
            'created_at',
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

        const [stores, totalStores] = await Promise.all([
            getAllStores({
                search,
                sortBy,
                order,
                limit,
                offset,
            }),
            countStores(search),
        ]);

        return res.status(200).json({
            success: true,
            stores,
            pagination: {
                totalStores,
                currentPage: page,
                totalPages: Math.ceil(totalStores / limit),
                limit,
            },
        });
    } catch (error) {
        console.error('Get stores error:', error.message);

        return res.status(500).json({
            success: false,
            message: 'Unable to retrieve stores.',
        });
    }
};

const getStoreDetails = async (req, res) => {
    try {
        const storeId = Number(req.params.id);

        if (!Number.isInteger(storeId) || storeId <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid store ID.',
            });
        }

        const store = await getStoreById(storeId);

        if (!store) {
            return res.status(404).json({
                success: false,
                message: 'Store not found.',
            });
        }

        return res.status(200).json({
            success: true,
            store,
        });
    } catch (error) {
        console.error('Get store details error:', error.message);

        return res.status(500).json({
            success: false,
            message: 'Unable to retrieve store details.',
        });
    }
};

module.exports = {
    addStore,
    getStores,
    getStoreDetails,
};
