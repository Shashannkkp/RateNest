
require('dotenv').config();

if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is missing from the .env file.');
}

const express = require('express');
const cors = require('cors');

const pool = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const storeRoutes = require('./routes/storeRoutes');
const userStoreRoutes = require('./routes/userStoreRoutes');
const ratingRoutes = require('./routes/ratingRoutes');
const ownerRoutes = require('./routes/ownerRoutes');
const adminRatingRoutes = require('./routes/adminRatingRoutes');

const app = express();

const PORT = Number(process.env.PORT || 5000);

if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) {
    throw new Error('Invalid PORT configuration.');
}

const allowedOrigins = (
    process.env.FRONTEND_URL || 'http://localhost:5173'
)
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error('Origin not allowed by CORS.'));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '1mb' }));

app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Welcome to RateNest API!',
    });
});

app.get('/api/health', async (req, res) => {
    try {
        await pool.query('SELECT 1');

        res.status(200).json({
            success: true,
            message: 'RateNest backend and database are running!',
        });
    } catch (error) {
        console.error('Database health check failed:', error.message);

        res.status(503).json({
            success: false,
            message: 'Database connection is unavailable.',
        });
    }
});

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/dashboard', dashboardRoutes);
app.use('/api/admin/stores', storeRoutes);
app.use('/api/admin/ratings', adminRatingRoutes);
app.use('/api/stores', userStoreRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/owner', ownerRoutes);

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'API route not found.',
    });
});

app.use((error, req, res, next) => {
    console.error('Server error:', error.message);

    if (res.headersSent) {
        return next(error);
    }

    if (error.message === 'Origin not allowed by CORS.') {
        return res.status(403).json({
            success: false,
            message: 'Request origin is not allowed.',
        });
    }

    if (error.type === 'entity.too.large') {
        return res.status(413).json({
            success: false,
            message: 'Request body is too large.',
        });
    }

    if (error instanceof SyntaxError && error.status === 400) {
        return res.status(400).json({
            success: false,
            message: 'Invalid JSON request body.',
        });
    }

    return res.status(500).json({
        success: false,
        message: 'Internal server error.',
    });
});

const server = app.listen(PORT, () => {
    console.log(`RateNest API running at http://localhost:${PORT}`);
});

const shutdown = () => {
    server.close(async () => {
        try {
            await pool.end();
            console.log('RateNest server and database connections closed.');
            process.exit(0);
        } catch (error) {
            console.error('Shutdown error:', error.message);
            process.exit(1);
        }
    });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
