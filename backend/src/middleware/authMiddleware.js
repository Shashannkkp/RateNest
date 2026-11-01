
const jwt = require('jsonwebtoken');

// Verify the user's login token
const authenticateUser = (req, res, next) => {
    try {
        // Get the token from the Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. Please log in.',
            });
        }

        const token = authHeader.split(' ')[1];

        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach verified user information to the request
        req.user = {
            userId: decoded.userId,
            role: decoded.role,
        };

        next();

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired login token.',
        });
    }
};

// Check whether the user has the required role
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
