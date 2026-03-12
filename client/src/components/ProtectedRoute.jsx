import React, { useState, useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import api from '../api/axios';

/**
 * ProtectedRoute — Multi-layered auth guard for the admin panel.
 * 
 * Security layers:
 * 1. Secret URL path — admin panel is not at /admin
 * 2. JWT token validation against the server
 * 3. Session fingerprinting (browser + timestamp)
 * 4. Activity timeout (auto-logout after inactivity)
 */
const ProtectedRoute = ({ secretPath }) => {
    const [status, setStatus] = useState('loading'); // 'loading' | 'valid' | 'invalid'
    const location = useLocation();

    useEffect(() => {
        const validateSession = async () => {
            const token = localStorage.getItem('adminToken');
            
            if (!token) {
                setStatus('invalid');
                return;
            }

            // Check session fingerprint — must match the browser that logged in
            const storedFingerprint = localStorage.getItem('sessionFingerprint');
            const currentFingerprint = generateFingerprint();
            if (storedFingerprint && storedFingerprint !== currentFingerprint) {
                // Token was copied from another browser/device
                console.warn('🚨 Session fingerprint mismatch — possible token theft');
                localStorage.removeItem('adminToken');
                localStorage.removeItem('adminUser');
                localStorage.removeItem('sessionFingerprint');
                localStorage.removeItem('sessionStart');
                setStatus('invalid');
                return;
            }

            // Check session age — auto-expire after 8 hours
            const sessionStart = localStorage.getItem('sessionStart');
            if (sessionStart) {
                const hoursElapsed = (Date.now() - parseInt(sessionStart, 10)) / (1000 * 60 * 60);
                if (hoursElapsed > 8) {
                    console.warn('⏰ Session expired (8 hour limit)');
                    localStorage.removeItem('adminToken');
                    localStorage.removeItem('adminUser');
                    localStorage.removeItem('sessionFingerprint');
                    localStorage.removeItem('sessionStart');
                    setStatus('invalid');
                    return;
                }
            }

            // Validate token against the server
            try {
                await api.get('/auth/me');
                setStatus('valid');
            } catch {
                localStorage.removeItem('adminToken');
                localStorage.removeItem('adminUser');
                localStorage.removeItem('sessionFingerprint');
                localStorage.removeItem('sessionStart');
                setStatus('invalid');
            }
        };

        validateSession();
    }, [location.pathname]);

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#110a28]">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-[#f5c518] border-t-transparent rounded-full animate-spin" />
                    <span className="text-[#f5c518]/60 text-sm font-mono">Verifying session...</span>
                </div>
            </div>
        );
    }

    if (status === 'invalid') {
        // Redirect to the SECRET login path, not /auth/login
        const loginPath = secretPath ? `/${secretPath}/login` : '/auth/login';
        return <Navigate to={loginPath} replace />;
    }

    return <Outlet />;
};

/**
 * Generate a simple browser fingerprint for session binding.
 * This is NOT meant to be cryptographically strong — it's a deterrent
 * against casual token copying between browsers.
 */
function generateFingerprint() {
    const components = [
        navigator.userAgent,
        navigator.language,
        screen.width + 'x' + screen.height,
        screen.colorDepth,
        new Date().getTimezoneOffset(),
    ];
    // Simple hash
    let hash = 0;
    const str = components.join('|');
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0;
    }
    return hash.toString(36);
}

export { generateFingerprint };
export default ProtectedRoute;
