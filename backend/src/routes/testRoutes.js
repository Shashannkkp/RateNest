
const express = require('express');

const {
    authenticateUser,
    authorizeRoles,
} = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/profile', authenticateUser, (req, res) => {
    res.status(200).json({
        success: true,
        message: 'You are successfully authenticated.',
        user: req.user,
    });
});

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
