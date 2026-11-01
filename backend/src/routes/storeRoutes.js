
const express = require('express');

const {
    addStore,
    getStores,
    getStoreDetails,
} = require('../controllers/storeController');

const {
    authenticateUser,
    authorizeRoles,
} = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authenticateUser, authorizeRoles('ADMIN'));

router.post('/', addStore);

router.get('/', getStores);

router.get('/:id', getStoreDetails);

module.exports = router;
