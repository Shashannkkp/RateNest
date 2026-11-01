
const express = require('express');

const {
    getUserStores,
    getUserStoreDetails,
} = require('../controllers/userStoreController');

const {
    authenticateUser,
    authorizeRoles,
} = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authenticateUser, authorizeRoles('USER'));

router.get('/', getUserStores);

router.get('/:id', getUserStoreDetails);

module.exports = router;
