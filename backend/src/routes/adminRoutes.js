
const express = require('express');

const {
    getUsers,
    getUserDetails,
    createUser,
    assignOwner,
} = require('../controllers/adminController');

const {
    authenticateUser,
    authorizeRoles,
} = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authenticateUser, authorizeRoles('ADMIN'));

router.get('/users', getUsers);

router.get('/users/:id', getUserDetails);

router.post('/users', createUser);

router.put('/stores/:storeId/owner', assignOwner);

module.exports = router;
