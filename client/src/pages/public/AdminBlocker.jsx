import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, AlertTriangle, Eye } from 'lucide-react';

/**
 * AdminBlocker — shown when someone tries to access /admin directly.
 * This is a decoy / honeypot page that displays a strong warning.
 * The real admin panel lives at a secret URL defined by VITE_ADMIN_SECRET_PATH.
 */
const AdminBlocker = () => {
    const [attempts, setAttempts] = useState(0);
    const [ipLogged, setIpLogged] = useState(false);

    useEffect(() => {
        // Log this unauthorized access attempt
        const logAttempt = async () => {
            try {
                // Fetch public IP for logging
                const ipRes = await fetch('https://api.ipify.org?format=json').catch(() => null);
                const ipData = ipRes ? await ipRes.json().catch(() => ({})) : {};
                
                console.warn('🚨 UNAUTHORIZED ADMIN ACCESS ATTEMPT', {
                    timestamp: new Date().toISOString(),
                    ip: ipData.ip || 'unknown',
                    userAgent: navigator.userAgent,
                    referrer: document.referrer,
                    path: window.location.pathname,
                });
                setIpLogged(true);
            } catch {
                setIpLogged(true);
            }
        };
        logAttempt();

        // Increment attempts from session storage
        const prev = parseInt(sessionStorage.getItem('adminAttempts') || '0', 10);
        const next = prev + 1;
        sessionStorage.setItem('adminAttempts', String(next));
        setAttempts(next);
    }, []);

    const messages = [
        "Don't be smart please, you are not allowed to do so.",
        "Nice try. This area is restricted and monitored.",
        "Your access attempt has been logged. Please leave.",
        "Seriously? Go away. This is your final warning.",
        "🚨 All your attempts are being recorded. Stop now."
    ];

    const getMessage = () => messages[Math.min(attempts - 1, messages.length - 1)] || messages[0];

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4 overflow-hidden relative">
            {/* Animated warning background */}
            <div className="absolute inset-0 overflow-hidden">
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute text-red-900/10 font-mono text-xs"
                        initial={{ opacity: 0 }}
                        animate={{ 
                            opacity: [0, 0.3, 0],
                            y: [Math.random() * 100, Math.random() * 100 - 50]
                        }}
                        transition={{ 
                            duration: 3 + Math.random() * 4,
                            repeat: Infinity,
                            delay: Math.random() * 2
                        }}
                        style={{ 
                            left: `${Math.random() * 100}%`, 
                            top: `${Math.random() * 100}%` 
                        }}
                    >
                        ACCESS DENIED
                    </motion.div>
                ))}
            </div>

            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                className="relative z-10 max-w-lg w-full text-center"
            >
                {/* Pulsing shield icon */}
                <motion.div
                    animate={{ 
                        scale: [1, 1.1, 1],
                        boxShadow: [
                            '0 0 20px rgba(220, 38, 38, 0.3)',
                            '0 0 60px rgba(220, 38, 38, 0.6)',
                            '0 0 20px rgba(220, 38, 38, 0.3)'
                        ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-24 h-24 mx-auto mb-8 rounded-full bg-red-950/50 border-2 border-red-600 flex items-center justify-center"
                >
                    <ShieldAlert className="w-12 h-12 text-red-500" />
                </motion.div>

                {/* Warning text */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                        <span className="text-red-500 font-mono text-sm tracking-wider uppercase">
                            Access Denied
                        </span>
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                    </div>

                    <h1 className="text-2xl md:text-3xl font-bold text-white mb-4 leading-snug">
                        {getMessage()}
                    </h1>

                    <p className="text-red-400/70 text-sm mb-6">
                        This page does not exist. There is no admin panel here.
                    </p>
                </motion.div>

                {/* Threat indicators */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="bg-red-950/30 border border-red-900/50 rounded-lg p-4 text-left space-y-2"
                >
                    <div className="flex items-center gap-2 text-red-400 text-xs font-mono">
                        <Eye className="w-3.5 h-3.5" />
                        <span>IP Address: {ipLogged ? 'LOGGED ✓' : 'LOGGING...'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-red-400 text-xs font-mono">
                        <Eye className="w-3.5 h-3.5" />
                        <span>Browser Fingerprint: CAPTURED ✓</span>
                    </div>
                    <div className="flex items-center gap-2 text-red-400 text-xs font-mono">
                        <Eye className="w-3.5 h-3.5" />
                        <span>Access Attempt #{attempts}: RECORDED ✓</span>
                    </div>
                    <div className="flex items-center gap-2 text-red-400 text-xs font-mono">
                        <Eye className="w-3.5 h-3.5" />
                        <span>Timestamp: {new Date().toISOString()}</span>
                    </div>
                </motion.div>

                {/* Warning footer */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                    className="mt-6 text-red-600/40 text-xs font-mono"
                >
                    Unauthorized access attempts may result in legal action.
                    <br />
                    शाश्वतम् Security System v2.0
                </motion.p>
            </motion.div>
        </div>
    );
};

export default AdminBlocker;
