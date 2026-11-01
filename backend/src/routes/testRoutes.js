
const express = require('express');

const {
    authenticateUser,
    authorizeRoles,
} = require('../middleware/authMiddleware');

const router = express.Router();

// Any logged-in user can access this route
router.get('/profile', authenticateUser, (req, res) => {
    res.status(200).json({
        success: true,
        message: 'You are successfully authenticated.',
        user: req.user,
    });
});

// Only Admin users can access this route
router.get(
    '/admin',
    authenticateUser,
    authorizeRoles('ADMIN'),
    (req, res) => {
        res.status(200).json({
            success: true,
            message: 'Welcome, Admin!',
        });
    }
);

module.exports = router;
