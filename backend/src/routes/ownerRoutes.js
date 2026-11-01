
const express = require('express');

const {
    getOwnerDashboard,
    getOwnerRatings,
} = require('../controllers/ownerController');

const {
    authenticateUser,
    authorizeRoles,
} = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authenticateUser, authorizeRoles('STORE_OWNER'));

router.get('/dashboard', getOwnerDashboard);

router.get('/ratings', getOwnerRatings);

module.exports = router;
