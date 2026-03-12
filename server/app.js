/**
 * Express App Factory
 * 
 * Exports the Express app WITHOUT starting the server.
 * This allows tests to use supertest against the app without binding to a port.
 * server.js imports this and calls .listen() for production.
 */
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');

// Route imports
const matchRoutes = require('./routes/matchRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes');
const seasonRoutes = require('./routes/seasonRoutes');
const scoringPresetRoutes = require('./routes/scoringPresetRoutes');
const studentCouncilRoutes = require('./routes/studentCouncilRoutes');
const aboutRoutes = require('./routes/aboutRoutes');
const adminRoutes = require('./routes/adminRoutes');
const playerRoutes = require('./routes/playerRoutes');
const foulRoutes = require('./routes/foulRoutes');
const highlightRoutes = require('./routes/highlightRoutes');

const { errorHandler } = require('./middleware/errorHandler');
const { authLogger, securityHeaders, sanitizeInput, loginRateLimiter } = require('./middleware/securityMiddleware');

function createApp() {
    const app = express();

    // ── Security ──
    app.use(helmet({
        contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
        crossOriginEmbedderPolicy: false,
        crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow images to load from separate frontend origin
    }));

    // ── CORS ──
    const allowedOrigins = process.env.CORS_ORIGIN
        ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
        : ['http://localhost:5173'];

    app.use(cors({
        origin: function (origin, callback) {
            if (!origin) return callback(null, true);
            if (allowedOrigins.includes(origin)) return callback(null, origin);
            return callback(new Error('Not allowed by CORS'));
        },
        credentials: true
    }));

    // ── Rate Limiting (skip in test to avoid flaky tests) ──
    if (process.env.NODE_ENV !== 'test') {
        const rateLimit = require('express-rate-limit');
        const authLimiter = rateLimit({
            windowMs: 15 * 60 * 1000,
            max: 20,
            message: { message: 'Too many login attempts. Please try again after 15 minutes.' },
            standardHeaders: true,
            legacyHeaders: false,
        });
        const apiLimiter = rateLimit({
            windowMs: 1 * 60 * 1000,
            max: 120,
            message: { message: 'Too many requests. Please slow down.' },
            standardHeaders: true,
            legacyHeaders: false,
        });
        app.use('/api/auth', authLimiter);
        app.use('/api/matches', apiLimiter);
    }

    // ── Body Parsing & Compression ──
    app.use(compression());
    app.use(express.json({ limit: '1mb' }));
    app.use(express.urlencoded({ extended: true }));

    // ── Static Files (uploads — images, logos, photos) ──
    // Override Helmet's restrictive CORP header so images load cross-origin (Vercel→Railway)
    app.use('/uploads', (req, res, next) => {
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
        res.setHeader('Cache-Control', 'public, max-age=86400'); // 24h cache
        next();
    }, express.static(path.join(__dirname, 'uploads')));

    // ── Logging (dev only) ──
    if (process.env.NODE_ENV === 'development') {
        app.use(morgan('dev'));
    }

    // ── Health Check ──
    app.get('/alive', (req, res) => res.json({ status: 'alive' }));
    app.get('/api/health', (req, res) => {
        res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    // ── API Routes ──
    // Apply security headers and input sanitization to all API routes
    app.use('/api', securityHeaders);
    app.use('/api', sanitizeInput);
    
    // Auth routes get additional logging and brute-force protection
    app.use('/api/auth', authLogger);
    app.use('/api/auth/login', loginRateLimiter);
    
    app.use('/api/auth', require('./routes/authRoutes'));
    app.use('/api/matches', matchRoutes);
    app.use('/api/departments', departmentRoutes);
    app.use('/api/leaderboard', leaderboardRoutes);
    app.use('/api/seasons', seasonRoutes);
    app.use('/api/scoring-presets', scoringPresetRoutes);
    app.use('/api/student-council', studentCouncilRoutes);
    app.use('/api/about', aboutRoutes);
    app.use('/api/admins', adminRoutes);
    app.use('/api/players', playerRoutes);
    app.use('/api/fouls', foulRoutes);
    app.use('/api/highlights', highlightRoutes);

    // ── Honeypot routes — log and reject requests to obvious admin paths ──
    const honeypotHandler = (req, res) => {
        const ip = req.ip || req.connection.remoteAddress;
        console.warn(`🍯 HONEYPOT HIT: ${req.method} ${req.originalUrl} from ${ip}`);
        res.status(404).json({ message: 'Not found' });
    };
    app.all('/admin', honeypotHandler);
    app.all('/admin/:path', honeypotHandler);
    app.all('/wp-admin', honeypotHandler);
    app.all('/wp-admin/:path', honeypotHandler);
    app.all('/administrator', honeypotHandler);
    app.all('/administrator/:path', honeypotHandler);
    app.all('/panel', honeypotHandler);
    app.all('/panel/:path', honeypotHandler);
    app.all('/dashboard', honeypotHandler);

    // ── Error Handler (must be last) ──
    app.use(errorHandler);

    return app;
}

module.exports = createApp;
