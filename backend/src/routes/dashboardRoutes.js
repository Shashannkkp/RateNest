
const express = require('express');

const { getDashboard } = require('../controllers/dashboardController');

const {
    authenticateUser,
    authorizeRoles,
} = require('../middleware/authMiddleware');

const router = express.Router();

router.get(
    '/',
    authenticateUser,
    authorizeRoles('ADMIN'),
    getDashboard
);

module.exports = router;
