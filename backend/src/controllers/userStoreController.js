
const {
    getStoresForUser,
    getStoreForUser,
} = require('../models/userStoreModel');

const getUserStores = async (req, res) => {
    try {
        const search =
            typeof req.query.search === 'string'
                ? req.query.search.trim()
                : '';

        if (search.length > 100) {
            return res.status(400).json({
                success: false,
                message: 'Search must not exceed 100 characters.',
            });
        }

        const stores = await getStoresForUser(
            req.user.userId,
            search
        );

        return res.status(200).json({
            success: true,
            count: stores.length,
            stores,
        });
    } catch (error) {
        console.error('Get user stores error:', error.message);

        return res.status(500).json({
            success: false,
            message: 'Unable to retrieve stores.',
        });
    }
};

const getUserStoreDetails = async (req, res) => {
    try {
        const storeId = Number(req.params.id);

        if (!Number.isInteger(storeId) || storeId <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid store ID.',
            });
        }

        const store = await getStoreForUser(
            storeId,
            req.user.userId
        );

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
        console.error('Get user store details error:', error.message);

        return res.status(500).json({
            success: false,
            message: 'Unable to retrieve store details.',
        });
    }
};

module.exports = {
    getUserStores,
    getUserStoreDetails,
};
