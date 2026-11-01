
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const {
    findUserByEmail,
    findUserById,
    createUser,
    updateUserPassword,
} = require('../models/userModel');

const {
    validateRegistration,
    validateNewPassword,
} = require('../validators/authValidator');

const pool = require('../config/db');

const registerUser = async (req, res) => {
    try {
        const { name, email, address, password } = req.body;

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

        const existingUser = await findUserByEmail(normalizedEmail);

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'An account with this email already exists.',
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const roleResult = await pool.query(
            'SELECT id FROM roles WHERE name = $1',
            ['USER']
        );

        if (roleResult.rows.length === 0) {
            return res.status(500).json({
                success: false,
                message: 'User role is not configured.',
            });
        }

        const newUser = await createUser({
            name: name.trim(),
            email: normalizedEmail,
            address: address.trim(),
            password: hashedPassword,
            roleId: roleResult.rows[0].id,
        });

        return res.status(201).json({
            success: true,
            message: 'Account created successfully.',
            user: newUser,
        });
    } catch (error) {
        console.error('Registration error:', error.message);

        return res.status(500).json({
            success: false,
            message: 'Unable to register your account.',
        });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (
            !email ||
            typeof email !== 'string' ||
            !password ||
            typeof password !== 'string'
        ) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required.',
            });
        }

        const user = await findUserByEmail(
            email.trim().toLowerCase()
        );

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.',
            });
        }

        const isPasswordValid = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.',
            });
        }

        const token = jwt.sign(
    {
        userId: user.id,
        role: user.role,
        tokenVersion: user.token_version,
    },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
);

        return res.status(200).json({
            success: true,
            message: 'Login successful.',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                address: user.address,
                role: user.role,
            },
        });
    } catch (error) {
        console.error('Login error:', error.message);

        return res.status(500).json({
            success: false,
            message: 'Unable to log in.',
        });
    }
};

const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (
            typeof currentPassword !== 'string' ||
            typeof newPassword !== 'string' ||
            !currentPassword ||
            !newPassword
        ) {
            return res.status(400).json({
                success: false,
                message: 'Current password and new password are required.',
            });
        }

        if (!validateNewPassword(newPassword)) {
            return res.status(400).json({
                success: false,
                message: 'New password must be 8-16 characters and contain at least one uppercase letter and one special character.',
            });
        }

        const user = await findUserById(req.user.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User account not found.',
            });
        }

        const isCurrentPasswordValid = await bcrypt.compare(
            currentPassword,
            user.password
        );

        if (!isCurrentPasswordValid) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect.',
            });
        }

        const isSamePassword = await bcrypt.compare(
            newPassword,
            user.password
        );

        if (isSamePassword) {
            return res.status(400).json({
                success: false,
                message: 'New password must be different from your current password.',
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 12);

        await updateUserPassword(
            req.user.userId,
            hashedPassword
        );

        return res.status(200).json({
            success: true,
            message: 'Password changed successfully.',
        });
    } catch (error) {
        console.error('Change password error:', error.message);

        return res.status(500).json({
            success: false,
            message: 'Unable to change password.',
        });
    }
};

module.exports = {
    registerUser,
    loginUser,
    changePassword,
};
