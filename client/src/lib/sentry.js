/**
 * Sentry Frontend Initialization — VNIT IG App
 * 
 * Configured specifically for:
 * - Real-time Socket.io live score updates (breadcrumb tracking)
 * - Heavy Framer Motion animations (performance profiling)
 * - Three.js WebGL canvas (error isolation)
 * - Admin vs Public route segmentation
 * 
 * SETUP:
 * 1. Create a free Sentry project at https://sentry.io
 * 2. Set VITE_SENTRY_DSN in your .env file
 * 3. This file auto-initializes when imported in main.jsx
 */
import * as Sentry from '@sentry/react';

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;
const IS_PROD = import.meta.env.PROD;

export function initSentry() {
    if (!SENTRY_DSN) {
        if (import.meta.env.DEV) {
            console.log('ℹ️  Sentry DSN not set — skipping init (set VITE_SENTRY_DSN in .env)');
        }
        return;
    }

    Sentry.init({
        dsn: SENTRY_DSN,
        environment: IS_PROD ? 'production' : 'development',
        release: `vnit-ig-frontend@${import.meta.env.VITE_APP_VERSION || '1.0.0'}`,

        // ─── Sampling ───
        // Capture 100% of errors, but only 20% of transactions for perf monitoring
        // During inter-branch finals, bump tracesSampleRate to 1.0 via env var
        sampleRate: 1.0,
        tracesSampleRate: parseFloat(import.meta.env.VITE_SENTRY_TRACES_RATE || '0.2'),
        replaysSessionSampleRate: 0.1,  // 10% of sessions get replay
        replaysOnErrorSampleRate: 1.0,  // 100% replay on error

        // ─── Integrations tailored for this app ───
        integrations: [
            // Browser tracing — tracks route changes, XHR, fetch
            Sentry.browserTracingIntegration({
                // Track React Router v6 navigations
                routingInstrumentation: Sentry.reactRouterV6BrowserTracingIntegration,
            }),
            // Replay — records DOM for crash debugging (the "DVR for errors")
            Sentry.replayIntegration({
                maskAllText: false,    // We don't handle sensitive data on public pages
                blockAllMedia: false,  // Allow replay of match photos
            }),
        ],

        // ─── Filtering — reduce noise ───
        ignoreErrors: [
            // Browser extensions
            'ResizeObserver loop',
            'ResizeObserver loop completed with undelivered notifications',
            // Network glitches (handled by our axios interceptor)
            'Network Error',
            'Failed to fetch',
            'Load failed',
            'AbortError',
            // Socket.io reconnection (expected on mobile networks)
            'xhr poll error',
            'websocket error',
            // Chrome DevTools
            'chrome-extension://',
            'moz-extension://',
        ],
        denyUrls: [
            // Don't track errors from browser extensions or analytics
            /extensions\//i,
            /^chrome:\/\//i,
            /^moz-extension:\/\//i,
            /gtag\/js/i,
            /analytics\.js/i,
        ],

        // ─── Before-send hook: enrich + filter ───
        beforeSend(event, hint) {
            const error = hint?.originalException;

            // Tag which section of the app crashed (public vs admin)
            const path = window.location.pathname;
            event.tags = {
                ...event.tags,
                section: path.includes('shashwatam-control') ? 'admin' : 'public',
                page: path,
                theme: localStorage.getItem('ig-theme') || 'shashwatam',
            };

            // Attach current socket connection state
            event.extra = {
                ...event.extra,
                socketConnected: window.__SOCKET_CONNECTED ?? 'unknown',
                visibleMatches: document.querySelectorAll('[data-match-id]')?.length ?? 0,
                viewportWidth: window.innerWidth,
                viewportHeight: window.innerHeight,
                online: navigator.onLine,
            };

            // Drop errors from non-production if DSN is accidentally shared
            if (!IS_PROD && !import.meta.env.VITE_SENTRY_FORCE_DEV) {
                return null;
            }

            return event;
        },

        // ─── Breadcrumbs — track user journey leading to crash ───
        beforeBreadcrumb(breadcrumb) {
            // Enrich fetch breadcrumbs with API endpoint names
            if (breadcrumb.category === 'fetch' || breadcrumb.category === 'xhr') {
                const url = breadcrumb.data?.url || '';
                if (url.includes('/api/matches')) breadcrumb.message = 'API: Fetch Matches';
                if (url.includes('/api/leaderboard')) breadcrumb.message = 'API: Leaderboard';
                if (url.includes('/api/highlights')) breadcrumb.message = 'API: Highlights';
                if (url.includes('/api/student-council')) breadcrumb.message = 'API: Student Council';
                if (url.includes('/api/auth')) breadcrumb.message = 'API: Auth';
            }
            return breadcrumb;
        },
    });

    console.log('🛡️  Sentry initialized for frontend monitoring');
}

/**
 * Wrap any component with Sentry error tracking
 * Usage: export default withSentryErrorBoundary(MyComponent);
 */
export const SentryErrorBoundary = Sentry.ErrorBoundary;

/**
 * Create a Sentry transaction for performance-critical operations
 * Usage: const span = startSpan('load-match-detail'); ... span.end();
 */
export function startSpan(name, op = 'function') {
    return Sentry.startInactiveSpan({ name, op });
}

/**
 * Capture a custom message (non-error) for tracking
 * Usage: captureMessage('Live match started', 'info');
 */
export function captureMessage(msg, level = 'info') {
    if (SENTRY_DSN) Sentry.captureMessage(msg, level);
}

/**
 * Set the current user context (call after admin login)
 */
export function setSentryUser(user) {
    if (!SENTRY_DSN) return;
    Sentry.setUser(user ? {
        id: user._id || user.id,
        username: user.username,
        role: user.role,
    } : null);
}

export default Sentry;
