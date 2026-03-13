import { io } from 'socket.io-client';

// In development, use WebSocket directly to the local backend.
// In production, connect DIRECTLY to the AWS backend (not through Vercel).
// Vercel serverless rewrites can't maintain socket.io polling sessions
// because each polling request hits a different serverless function instance.
const isDev = import.meta.env.DEV;

// In dev: connect to local backend.
// In prod: connect directly to the AWS backend via VITE_SOCKET_URL.
// Falls back to same origin (but Vercel proxy won't work for socket.io).
const SOCKET_URL = isDev
    ? (import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000')
    : (import.meta.env.VITE_SOCKET_URL || window.location.origin);

// Use WebSocket in dev (fast). In prod: try WebSocket first (direct to AWS),
// fall back to polling. Since we bypass Vercel, WebSocket upgrades work.
const TRANSPORTS = isDev ? ['websocket', 'polling'] : ['websocket', 'polling'];

if (isDev) console.log('🔌 Socket connecting to:', SOCKET_URL, 'via', TRANSPORTS);

export const socket = io(SOCKET_URL, {
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: Infinity,  // Keep trying forever (campus Wi-Fi drops)
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
    connectTimeout: 45000,
    transports: TRANSPORTS,
    withCredentials: false,
    upgrade: true,        // Allow upgrading from polling to WebSocket
    forceNew: false,
    multiplex: true,
    // Keep connection alive
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

// Always log connect errors in production too (helps debug deployment issues)
if (!isDev) {
    socket.on('connect_error', (error) => {
        console.warn('⚠️ Socket connection error:', error.message);
    });
}

// Always handle server-initiated disconnect (reconnect automatically)
socket.on('disconnect', (reason) => {
    if (reason === 'io server disconnect') {
        socket.connect();
    }
});

export default socket;
