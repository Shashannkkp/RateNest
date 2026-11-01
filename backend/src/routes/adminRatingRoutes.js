
const express = require('express');

const {
    getRatings,
} = require('../controllers/adminRatingController');

const {
    authenticateUser,
    authorizeRoles,
} = require('../middleware/authMiddleware');

const router = express.Router();

router.use(
    authenticateUser,
    authorizeRoles('ADMIN')
);

router.get('/', getRatings);

module.exports = router;
