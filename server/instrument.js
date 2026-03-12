/**
 * Sentry Backend Initialization — VNIT IG App
 * 
 * MUST be required at the very top of server.js BEFORE Express.
 * Captures:
 * - Unhandled exceptions & promise rejections
 * - Express route errors (via Sentry middleware)
 * - MongoDB query performance
 * - Socket.io errors
 * 
 * SETUP:
 * 1. Set SENTRY_DSN in server/.env
 * 2. require('./instrument') as the first line in server.js
 */
const Sentry = require('@sentry/node');

const SENTRY_DSN = process.env.SENTRY_DSN;

function initSentryBackend() {
    if (!SENTRY_DSN) {
        if (process.env.NODE_ENV !== 'production') {
            console.log('ℹ️  Sentry DSN not set — skipping backend init (set SENTRY_DSN in .env)');
        }
        return;
    }

    Sentry.init({
        dsn: SENTRY_DSN,
        environment: process.env.NODE_ENV || 'development',
        release: `vnit-ig-backend@${process.env.APP_VERSION || '1.0.0'}`,

        // ─── Sampling ───
        tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_RATE || '0.3'),
        profilesSampleRate: 0.1,

        // ─── Integrations ───
        integrations: [
            // Auto-instruments HTTP, Express, MongoDB
            Sentry.mongoIntegration(),
            Sentry.expressIntegration(),
            Sentry.httpIntegration(),
        ],

        // ─── Filtering ───
        ignoreErrors: [
            // Expected operational errors (already handled by errorHandler.js)
            'TokenExpiredError',
            'Not allowed by CORS',
            'ECONNRESET',
            'EPIPE',
        ],

        // ─── Before-send hook ───
        beforeSend(event, hint) {
            const error = hint?.originalException;

            // Don't send operational errors (4xx) — they're expected
            if (error?.isOperational) return null;

            // Enrich with server context
            event.tags = {
                ...event.tags,
                nodeVersion: process.version,
                uptime: Math.round(process.uptime()),
            };

            event.extra = {
                ...event.extra,
                memoryUsage: process.memoryUsage(),
                activeConnections: global.__SOCKET_CONNECTIONS ?? 0,
            };

            return event;
        },
    });

    console.log('🛡️  Sentry initialized for backend monitoring');
}

initSentryBackend();

module.exports = Sentry;
