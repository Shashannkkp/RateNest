
const express = require('express');

const {
    submitRating,
    getMyRating,
} = require('../controllers/ratingController');

const {
    authenticateUser,
    authorizeRoles,
} = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authenticateUser, authorizeRoles('USER'));

router.post('/:storeId', submitRating);

router.get('/:storeId', getMyRating);

module.exports = router;
