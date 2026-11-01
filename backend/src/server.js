
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const pool = require('./config/db');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);

// Welcome route
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Welcome to RateNest API!',
    });
});

// Health check route
app.get('/api/health', async (req, res) => {
    try {
        await pool.query('SELECT 1');

        res.status(200).json({
            success: true,
            message: 'RateNest backend and database are running!',
        });
    } catch (error) {
        res.status(503).json({
            success: false,
            message: 'Database connection is unavailable.',
        });
    }
});

// Handle unknown routes
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'API route not found.',
    });
});

// Global error handler
app.use((error, req, res, next) => {
    console.error('Server error:', error.message);

    res.status(500).json({
        success: false,
        message: 'Internal server error.',
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`RateNest API running at http://localhost:${PORT}`);
});
