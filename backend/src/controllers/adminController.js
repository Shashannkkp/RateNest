const bcrypt = require('bcrypt');
const pool = require('../config/db');

const {
    getAllUsers,
    countUsers,
    getUserById,
    createUserByAdmin,
    assignStoreOwner,
} = require('../models/adminModel');

const { validateRegistration } = require('../validators/authValidator');

const getUsers = async (req, res) => {
    try {
        const search =
            typeof req.query.search === 'string'
                ? req.query.search.trim()
                : '';

        const role =
            typeof req.query.role === 'string'
                ? req.query.role.toUpperCase()
                : '';

        const sortBy =
            typeof req.query.sortBy === 'string'
                ? req.query.sortBy
                : 'created_at';

        const order =
            typeof req.query.order === 'string'
                ? req.query.order.toLowerCase()
                : 'desc';

        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;

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

        if (role && !['ADMIN', 'USER', 'STORE_OWNER'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role filter.',
            });
        }

        const allowedSortFields = [
            'name',
            'email',
            'role',
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

        const filters = {
            search,
            role,
        };

        const [users, totalUsers] = await Promise.all([
            getAllUsers({
                ...filters,
                sortBy,
                order,
                limit,
                offset,
            }),
            countUsers(filters),
        ]);

        return res.status(200).json({
            success: true,
            users,
            pagination: {
                totalUsers,
                currentPage: page,
                totalPages: Math.ceil(totalUsers / limit),
                limit,
            },
        });
    } catch (error) {
        console.error('Get users error:', error.message);

        return res.status(500).json({
            success: false,
            message: 'Unable to retrieve users.',
        });
    }
};

const getUserDetails = async (req, res) => {
    try {
        const userId = Number(req.params.id);

        if (!Number.isInteger(userId) || userId <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID.',
            });
        }

        const user = await getUserById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found.',
            });
        }

        return res.status(200).json({
            success: true,
            user,
        });
    } catch (error) {
        console.error('Get user details error:', error.message);

        return res.status(500).json({
            success: false,
            message: 'Unable to retrieve user details.',
        });
    }
};

const createUser = async (req, res) => {
    try {
        const { name, email, address, password, role } = req.body || {};
        const storeId = req.body?.storeId;

        if (!['ADMIN', 'USER', 'STORE_OWNER'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Role must be ADMIN, USER, or STORE_OWNER.',
            });
        }

        if (role === 'STORE_OWNER') {
            const parsedStoreId = Number(storeId);

            if (
                storeId === undefined ||
                storeId === null ||
                storeId === '' ||
                !Number.isInteger(parsedStoreId) ||
                parsedStoreId <= 0
            ) {
                return res.status(400).json({
                    success: false,
                    message: 'A valid store must be selected for a Store Owner.',
                });
            }
        }

        const errors = validateRegistration({
            name,
            email,
            address,
            password,
        });

        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Please correct the following errors.',
                errors,
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await pool.query(
            'SELECT id FROM users WHERE email = $1',
            [normalizedEmail]
        );

        if (existingUser.rows.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'An account with this email already exists.',
            });
        }

        const roleResult = await pool.query(
            'SELECT id FROM roles WHERE name = $1',
            [role]
        );

        if (roleResult.rows.length === 0) {
            return res.status(500).json({
                success: false,
                message: 'Requested role is not configured.',
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await createUserByAdmin({
            name: name.trim(),
            email: normalizedEmail,
            address: address.trim(),
            password: hashedPassword,
            roleId: roleResult.rows[0].id,
            storeId: role === 'STORE_OWNER' ? Number(storeId) : null,
        });

        return res.status(201).json({
            success: true,
            message: role === 'STORE_OWNER'
                ? 'Store Owner account created and store assigned successfully.'
                : `${role} account created successfully.`,
            user,
        });
    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({
                success: false,
                message: 'An account with this email already exists or the selected store is already assigned.',
            });
        }

        if (error.code === 'STORE_NOT_FOUND') {
            return res.status(404).json({
                success: false,
                message: 'The selected store does not exist.',
            });
        }

        if (error.code === 'STORE_ALREADY_ASSIGNED') {
            return res.status(409).json({
                success: false,
                message: 'The selected store already has an owner. Please select another store.',
            });
        }

        console.error('Create user error:', error.message);

        return res.status(500).json({
            success: false,
            message: 'Unable to create user account.',
        });
    }
};

const assignOwner = async (req, res) => {
    try {
        const storeId = Number(req.params.storeId);
        const ownerId = Number(req.body.ownerId);

        if (
            !Number.isInteger(storeId) || storeId <= 0 ||
            !Number.isInteger(ownerId) || ownerId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: 'Valid store ID and owner ID are required.',
            });
        }

        const ownerResult = await pool.query(
            `SELECT users.id
             FROM users
             INNER JOIN roles ON users.role_id = roles.id
             WHERE users.id = $1 AND roles.name = 'STORE_OWNER'`,
            [ownerId]
        );

        if (ownerResult.rows.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'The selected user is not a Store Owner.',
            });
        }

        const store = await assignStoreOwner(storeId, ownerId);

        if (!store) {
            return res.status(404).json({
                success: false,
                message: 'Store not found.',
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Store Owner assigned successfully.',
            store,
        });
    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({
                success: false,
                message: 'This Store Owner is already assigned to another store.',
            });
        }

        console.error('Assign owner error:', error.message);

        return res.status(500).json({
            success: false,
            message: 'Unable to assign Store Owner.',
        });
    }
};

module.exports = {
    getUsers,
    getUserDetails,
    createUser,
    assignOwner,
};