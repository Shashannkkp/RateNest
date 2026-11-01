
const jwt = require('jsonwebtoken');

const { getUserTokenVersion } = require('../models/userModel');

const validRoles = ['ADMIN', 'USER', 'STORE_OWNER'];

const authenticateUser = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. Please log in.',
            });
        }

        const token = authHeader.slice(7).trim();

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. Please log in.',
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (
            !decoded ||
            !Number.isInteger(decoded.userId) ||
            decoded.userId <= 0 ||
            !validRoles.includes(decoded.role) ||
            !Number.isInteger(decoded.tokenVersion)
        ) {
            return res.status(401).json({
                success: false,
                message: 'Invalid login token.',
            });
        }

        const user = await getUserTokenVersion(decoded.userId);

        if (!user || user.token_version !== decoded.tokenVersion) {
            return res.status(401).json({
                success: false,
                message: 'Your session has expired. Please log in again.',
            });
        }

        req.user = {
            userId: decoded.userId,
            role: decoded.role,
        };

        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired login token.',
            });
        }

        return next(error);
    }
};

const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to access this resource.',
            });
        }

        next();
    };
};

module.exports = {
    authenticateUser,
    authorizeRoles,
};
