/**
 * Robust Error Handler Middleware
 * 
 * Differentiates between:
 * - Operational Errors (bad user input, not found, auth failures → 4xx)
 * - Programming Errors (unexpected bugs, null refs → 500 + log full stack)
 * - Mongoose Validation/Cast errors → 400 with friendly messages
 */

class AppError extends Error {
    /**
     * @param {string} message - User-facing message
     * @param {number} statusCode - HTTP status code
     * @param {string} [code] - Machine-readable error code (e.g., 'VALIDATION_ERROR')
     */
    constructor(message, statusCode, code) {
        super(message);
        this.statusCode = statusCode;
        this.code = code || 'ERROR';
        this.isOperational = true; // Marks this as an expected/handled error
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Express error-handling middleware (4 args required for Express to recognize it)
 */
const errorHandler = (err, req, res, next) => {
    // Default to 500 if statusCode hasn't been set
    let statusCode = err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);
    let message = err.message || 'Internal Server Error';
    let code = err.code || 'INTERNAL_ERROR';
    let isOperational = err.isOperational || false;

    // ── Mongoose CastError (bad ObjectId) ──
    if (err.name === 'CastError') {
        statusCode = 400;
        message = `Invalid ${err.path}: ${err.value}`;
        code = 'INVALID_ID';
        isOperational = true;
    }

    // ── Mongoose Validation Error ──
    if (err.name === 'ValidationError') {
        statusCode = 400;
        const messages = Object.values(err.errors).map(e => e.message);
        message = `Validation failed: ${messages.join(', ')}`;
        code = 'VALIDATION_ERROR';
        isOperational = true;
    }

    // ── Mongoose Duplicate Key Error ──
    if (err.code === 11000) {
        statusCode = 409;
        const field = Object.keys(err.keyValue || {}).join(', ');
        message = `Duplicate value for: ${field}`;
        code = 'DUPLICATE_KEY';
        isOperational = true;
    }

    // ── JWT Errors ──
    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token';
        code = 'INVALID_TOKEN';
        isOperational = true;
    }
    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token expired. Please log in again.';
        code = 'TOKEN_EXPIRED';
        isOperational = true;
    }

    // ── Multer Errors (file upload) ──
    if (err.code === 'LIMIT_FILE_SIZE') {
        statusCode = 413;
        message = 'File too large. Maximum size is 5MB.';
        code = 'FILE_TOO_LARGE';
        isOperational = true;
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        statusCode = 400;
        message = 'Unexpected file field.';
        code = 'UNEXPECTED_FILE';
        isOperational = true;
    }

    // ── Log Programming Errors with full stack (never show to user) ──
    if (!isOperational) {
        console.error('🔴 PROGRAMMING ERROR:', {
            message: err.message,
            stack: err.stack,
            url: req.originalUrl,
            method: req.method,
            ip: req.ip,
            timestamp: new Date().toISOString(),
        });

        // Report programming errors to Sentry (operational errors are expected)
        try {
            const Sentry = require('@sentry/node');
            Sentry.captureException(err, {
                tags: { route: req.originalUrl, method: req.method },
                extra: { ip: req.ip, body: req.body, params: req.params },
            });
        } catch { /* Sentry not available — no-op */ }
    }

    // ── Build response ──
    const response = {
        success: false,
        code,
        message,
    };

    // Include stack trace only in development for debugging
    if (process.env.NODE_ENV !== 'production' && !isOperational) {
        response.stack = err.stack;
    }

    res.status(statusCode).json(response);
};

/**
 * Wraps async route handlers to auto-catch promise rejections.
 * Usage: router.get('/', asyncWrap(myHandler))
 */
const asyncWrap = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = { AppError, errorHandler, asyncWrap };
