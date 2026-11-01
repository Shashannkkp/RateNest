
const bcrypt = require('bcrypt');

const {
    findUserByEmail,
    createUser,
} = require('../models/userModel');

const { validateRegistration } = require('../validators/authValidator');

// Register a new normal user
const registerUser = async (req, res) => {
    try {
        const { name, email, address, password } = req.body;

        // Step 1: Validate the submitted information
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

        // Step 2: Normalize the email
        const normalizedEmail = email.trim().toLowerCase();

        // Step 3: Check whether the email is already registered
        const existingUser = await findUserByEmail(normalizedEmail);

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'An account with this email already exists.',
            });
        }

        // Step 4: Hash the password before saving it
        const hashedPassword = await bcrypt.hash(password, 12);

        // Step 5: Find the normal USER role
        const roleResult = await require('../config/db').query(
            'SELECT id FROM roles WHERE name = $1',
            ['USER']
        );

        if (roleResult.rows.length === 0) {
            return res.status(500).json({
                success: false,
                message: 'User role is not configured.',
            });
        }

        // Step 6: Save the new user
        const newUser = await createUser({
            name: name.trim(),
            email: normalizedEmail,
            address: address.trim(),
            password: hashedPassword,
            roleId: roleResult.rows[0].id,
        });

        // Step 7: Send a safe response without the password
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

module.exports = {
    registerUser,
};
