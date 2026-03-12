import { io } from 'socket.io-client';

// In development, connect to backend server directly
// In production, use same origin (frontend serves from backend)
const isDev = import.meta.env.DEV;
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL
    || (isDev ? 'http://localhost:5000' : window.location.origin);

if (isDev) console.log('🔌 Socket connecting to:', SOCKET_URL);

export const socket = io(SOCKET_URL, {
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
    connectTimeout: 45000,
    transports: ['websocket', 'polling'],
    withCredentials: false,
    upgrade: true,
    forceNew: false,
    multiplex: true,
    // Prevent premature disconnections
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

// Always handle server-initiated disconnect (reconnect automatically)
socket.on('disconnect', (reason) => {
    if (reason === 'io server disconnect') {
        socket.connect();
    }
});

export default socket;
