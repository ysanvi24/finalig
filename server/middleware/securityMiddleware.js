/**
 * Security Middleware — Additional hardening for the admin panel.
 * 
 * Features:
 * 1. Request logging for all auth endpoints
 * 2. Suspicious activity detection
 * 3. Enhanced headers for admin routes
 * 4. Brute-force detection with exponential backoff
 */

const loginAttempts = new Map(); // IP -> { count, lastAttempt, lockedUntil }
const suspiciousIPs = new Set();

/**
 * Track and rate-limit login attempts per IP
 */
const loginRateLimiter = (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    
    let record = loginAttempts.get(ip);
    if (!record) {
        record = { count: 0, lastAttempt: now, lockedUntil: 0 };
        loginAttempts.set(ip, record);
    }

    // Check if IP is locked out
    if (record.lockedUntil > now) {
        const waitMinutes = Math.ceil((record.lockedUntil - now) / 60000);
        console.warn(`🚫 Login blocked for IP ${ip} — locked for ${waitMinutes} more minutes`);
        return res.status(429).json({
            message: `Too many failed attempts. Try again in ${waitMinutes} minutes.`,
            lockedUntil: record.lockedUntil
        });
    }

    // Reset count if last attempt was over 30 minutes ago
    if (now - record.lastAttempt > 30 * 60 * 1000) {
        record.count = 0;
    }

    record.lastAttempt = now;
    record.count++;

    // Exponential lockout: 5 attempts → 5 min, 10 → 15 min, 15 → 60 min
    if (record.count >= 15) {
        record.lockedUntil = now + 60 * 60 * 1000; // 1 hour
        suspiciousIPs.add(ip);
        console.error(`🚨 SUSPICIOUS: IP ${ip} locked for 1 hour after ${record.count} attempts`);
        return res.status(429).json({ message: 'Account locked. Contact administrator.' });
    } else if (record.count >= 10) {
        record.lockedUntil = now + 15 * 60 * 1000; // 15 minutes
        console.warn(`⚠️ IP ${ip} locked for 15 minutes after ${record.count} attempts`);
        return res.status(429).json({ message: 'Too many attempts. Locked for 15 minutes.' });
    } else if (record.count >= 5) {
        record.lockedUntil = now + 5 * 60 * 1000; // 5 minutes
        console.warn(`⚠️ IP ${ip} locked for 5 minutes after ${record.count} attempts`);
        return res.status(429).json({ message: 'Too many attempts. Locked for 5 minutes.' });
    }

    next();
};

/**
 * Called on successful login to reset attempt counter
 */
const resetLoginAttempts = (ip) => {
    loginAttempts.delete(ip);
};

/**
 * Log all authentication-related requests
 */
const authLogger = (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const ua = req.headers['user-agent'] || 'unknown';
    const method = req.method;
    const path = req.originalUrl;
    
    console.log(`🔐 [AUTH] ${method} ${path} | IP: ${ip} | UA: ${ua.substring(0, 80)}`);
    
    // Flag suspicious patterns
    if (suspiciousIPs.has(ip)) {
        console.warn(`🚨 Known suspicious IP accessing auth: ${ip}`);
    }
    
    next();
};

/**
 * Add security headers to admin API responses
 */
const securityHeaders = (req, res, next) => {
    // Prevent caching of admin responses
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    res.set('Surrogate-Control', 'no-store');
    
    // Security headers
    res.set('X-Content-Type-Options', 'nosniff');
    res.set('X-Frame-Options', 'DENY');
    res.set('X-XSS-Protection', '1; mode=block');
    res.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    next();
};

/**
 * Validate that the request body doesn't contain injection attempts
 */
const sanitizeInput = (req, res, next) => {
    if (req.body) {
        const bodyStr = JSON.stringify(req.body);
        
        // Check for common injection patterns
        const dangerousPatterns = [
            /\$gt/i, /\$lt/i, /\$ne/i, /\$regex/i,  // MongoDB injection
            /\$where/i, /\$or/i, /\$and/i,            // MongoDB operators
            /<script/i,                                  // XSS
            /javascript:/i,                              // XSS
            /on\w+\s*=/i,                               // Event handler injection
        ];
        
        for (const pattern of dangerousPatterns) {
            if (pattern.test(bodyStr)) {
                const ip = req.ip || req.connection.remoteAddress;
                console.error(`🚨 INJECTION ATTEMPT from ${ip}: ${bodyStr.substring(0, 200)}`);
                suspiciousIPs.add(ip);
                return res.status(400).json({ message: 'Invalid input detected' });
            }
        }
    }
    next();
};

/**
 * Periodically clean up old login attempt records (every 30 min)
 */
setInterval(() => {
    const now = Date.now();
    const cutoff = now - 60 * 60 * 1000; // 1 hour
    for (const [ip, record] of loginAttempts) {
        if (record.lastAttempt < cutoff) {
            loginAttempts.delete(ip);
        }
    }
}, 30 * 60 * 1000);

module.exports = {
    loginRateLimiter,
    resetLoginAttempts,
    authLogger,
    securityHeaders,
    sanitizeInput,
    suspiciousIPs
};
