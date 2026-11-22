const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const errorHandler = require('./middleware/errorHandler');
const { sendError } = require('./utils/responseHandler');

const authRoutes = require('./routes/authRoutes');
const mallRoutes = require('./routes/mallRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const guardRoutes = require('./routes/guardRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Middleware setup
const allowedOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    // Allow non-browser tools (health checks, Postman) and configured frontend domains.
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'ParkEase API Server is running smoothly' });
});

// API Routes mounting
app.use('/api/auth', authRoutes);
app.use('/api/malls', mallRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/guard', guardRoutes);
app.use('/api/admin', adminRoutes);

// 404 Route Handler
app.use('*', (req, res) => {
  sendError(res, `Route ${req.originalUrl} not found`, 404);
});

// Global Centralized Error Handler
app.use(errorHandler);

module.exports = app;
