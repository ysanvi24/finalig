import { io } from 'socket.io-client';

// ── Socket.io Connection Strategy ──
// Dev:  WebSocket + polling directly to localhost:5000 (fast, no proxy)
// Prod: polling-only through Vercel rewrites (vercel.json rewrites
//       /socket.io/* → http://13.204.112.229/socket.io/*).
//       Browser sees same-origin HTTPS requests → no mixed content.
//       WebSocket can't traverse Vercel serverless edge, so polling only.
//       If VITE_SOCKET_URL is set (e.g. after adding HTTPS to EC2),
//       both WebSocket + polling are used for lower latency.
const isDev = import.meta.env.DEV;

// In dev: connect to local backend. In prod: use Vercel origin (rewrites
// proxy to AWS), or explicit VITE_SOCKET_URL if configured.
const SOCKET_URL = isDev
    ? (import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000')
    : (import.meta.env.VITE_SOCKET_URL || window.location.origin);

// Dev: WebSocket first (fast). Prod without explicit URL: polling-only
// (goes through Vercel rewrites). Prod with VITE_SOCKET_URL: both.
const TRANSPORTS = isDev
    ? ['websocket', 'polling']
    : (import.meta.env.VITE_SOCKET_URL ? ['websocket', 'polling'] : ['polling']);

if (isDev) console.log('🔌 Socket connecting to:', SOCKET_URL, 'via', TRANSPORTS);

export const socket = io(SOCKET_URL, {
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: Infinity,  // Keep trying (campus Wi-Fi drops)
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
    connectTimeout: 45000,
    transports: TRANSPORTS,
    withCredentials: false,
    upgrade: !isDev && !import.meta.env.VITE_SOCKET_URL ? false : true,
    forceNew: false,
    multiplex: true,
    pingTimeout: 60000,
    pingInterval: 25000
});

// ── Track socket state globally (used by Sentry context) ──
socket.on('connect', () => {
    window.__SOCKET_CONNECTED = true;
});
socket.on('disconnect', () => {
    window.__SOCKET_CONNECTED = false;
});

// Connection event handlers (dev-only logging)
if (isDev) {
    socket.on('connect', () => {
        console.log('✅ Socket.io connected:', socket.id);
        console.log('🔌 Transport:', socket.io.engine.transport.name);
    });

    socket.on('reconnect_attempt', (n) => console.log('🔄 Reconnection attempt:', n));
    socket.on('reconnect', (n) => console.log('✅ Socket.io reconnected after', n, 'attempts'));
    socket.on('reconnect_failed', () => console.error('❌ Socket reconnection failed after all attempts'));
    socket.on('connect_error', (error) => console.error('❌ Socket connection error:', error.message));
    socket.on('disconnect', (reason) => console.warn('⚠️  Socket disconnected:', reason));
}

// In production, only log the first connection error (not every retry)
if (!isDev) {
    let errorLogged = false;
    socket.on('connect_error', (error) => {
        if (!errorLogged) {
            console.warn('⚠️ Socket connection error:', error.message);
            errorLogged = true;
        }
    });
    socket.on('connect', () => {
        errorLogged = false;
        console.info('✅ Socket.io connected via', socket.io.engine.transport.name);
    });
}

// Always handle server-initiated disconnect (reconnect automatically)
socket.on('disconnect', (reason) => {
    if (reason === 'io server disconnect') {
        socket.connect();
    }
});

export default socket;
