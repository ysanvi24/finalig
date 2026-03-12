import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';
import { Lock, User, Shield } from 'lucide-react';
import { generateFingerprint } from '../../components/ProtectedRoute';

const ADMIN_SECRET_PATH = import.meta.env.VITE_ADMIN_SECRET_PATH || 'shashwatam-control-2026';

const Login = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Initialize Google Sign-In
    useEffect(() => {
        const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

        if (!googleClientId || googleClientId === 'YOUR_GOOGLE_CLIENT_ID_HERE') {
            console.warn('⚠️ Google OAuth Client ID not configured.');
            return;
        }

        const initializeGoogleSignIn = () => {
            if (window.google && window.google.accounts) {
                try {
                    window.google.accounts.id.initialize({
                        client_id: googleClientId,
                        callback: handleGoogleSignIn
                    });
                    const buttonElement = document.getElementById('google-signin-button');
                    if (buttonElement) {
                        window.google.accounts.id.renderButton(buttonElement, {
                            theme: 'outline',
                            size: 'large',
                            width: '100%',
                            text: 'signin_with'
                        });
                    }
                } catch (error) {
                    console.error('Error initializing Google Sign-In:', error);
                }
            }
        };

        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = initializeGoogleSignIn;
        script.onerror = () => console.error('Failed to load Google Identity Services');
        document.body.appendChild(script);

        return () => {
            try { document.body.removeChild(script); } catch (e) {}
        };
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/auth/login', formData);

            if (res.data.token) {
                localStorage.setItem('adminToken', res.data.token);
                localStorage.setItem('adminUser', JSON.stringify(res.data));
                
                // Store session security data
                localStorage.setItem('sessionFingerprint', generateFingerprint());
                localStorage.setItem('sessionStart', String(Date.now()));
                
                if (res.data.role === 'viewer' && !res.data.isTrusted) {
                    toast.error('Access denied. Admin privileges required.');
                    localStorage.removeItem('adminToken');
                    localStorage.removeItem('adminUser');
                    localStorage.removeItem('sessionFingerprint');
                    localStorage.removeItem('sessionStart');
                    return;
                }
                
                toast.success(`Welcome back, ${res.data.username || res.data.name}!`);
                navigate(`/${ADMIN_SECRET_PATH}/dashboard`, { replace: true });
            }
        } catch (error) {
            const msg = error.response?.data?.message;
            const hint = error.response?.data?.hint;
            const status = error.response?.status;
            
            if (!error.response) {
                // Network error - server not running or CORS issue
                toast.error('Cannot reach server. Make sure backend is running on port 5000.');
            } else if (status === 503) {
                // Database not connected
                toast.error(msg || 'Database not connected. Check server terminal.');
                if (hint) console.warn('Hint:', hint);
            } else {
                toast.error(msg || 'Invalid credentials');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async (response) => {
        setLoading(true);
        try {
            const base64Url = response.credential.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64).split('').map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
            );
            const googleData = JSON.parse(jsonPayload);

            const res = await api.post('/auth/register-oauth', {
                googleId: googleData.sub,
                email: googleData.email,
                name: googleData.name,
                picture: googleData.picture
            });

            if (res.data.token) {
                if (res.data.role === 'viewer' && !res.data.isTrusted) {
                    toast.error('Access pending. Contact an administrator.');
                    return;
                }
                
                localStorage.setItem('adminToken', res.data.token);
                localStorage.setItem('adminUser', JSON.stringify(res.data));
                localStorage.setItem('sessionFingerprint', generateFingerprint());
                localStorage.setItem('sessionStart', String(Date.now()));
                toast.success(`Welcome, ${res.data.name}!`);
                navigate(`/${ADMIN_SECRET_PATH}/dashboard`, { replace: true });
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Google sign-in failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen shashwatam-bg flex items-center justify-center bg-[var(--bg-primary)] p-4">
            <div className="bg-[var(--bg-secondary)] p-8 rounded-xl w-full max-w-md border border-[var(--border-color)]">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-14 h-14 mx-auto rounded-xl bg-[var(--color-accent-subtle)] flex items-center justify-center mb-4">
                        <Shield className="w-7 h-7 text-[var(--color-accent)]" />
                    </div>
                    <h1 className="text-2xl font-bold text-[var(--text-primary)]">Admin Login</h1>
                    <p className="text-sm text-[var(--text-secondary)] mt-1">Institute Gathering Sports Officials</p>
                </div>

                {/* Google Sign-In */}
                {import.meta.env.VITE_GOOGLE_CLIENT_ID && 
                 import.meta.env.VITE_GOOGLE_CLIENT_ID !== 'YOUR_GOOGLE_CLIENT_ID_HERE' ? (
                    <>
                        <div className="mb-6 flex justify-center">
                            <div id="google-signin-button" className="w-full"></div>
                        </div>
                        <div className="relative mb-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-[var(--border-color)]"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-3 bg-[var(--bg-secondary)] text-[var(--text-secondary)]">or</span>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="mb-6 p-3 bg-[var(--bg-tertiary)] rounded-lg">
                        <p className="text-xs text-[var(--text-secondary)]">
                            Google OAuth not configured. Set VITE_GOOGLE_CLIENT_ID in .env.local
                        </p>
                    </div>
                )}

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                            Username
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent outline-none transition"
                                placeholder="Enter username"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                            Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent outline-none transition"
                                placeholder="Enter password"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-2.5 rounded-lg text-[var(--text-primary)] font-medium transition ${
                            loading
                                ? 'bg-[var(--color-accent)]/60 cursor-not-allowed'
                                : 'bg-[var(--color-accent)] hover:bg-[var(--color-accent-dark)]'
                        }`}
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                {/* Footer */}
                <div className="mt-6 text-center">
                    <p className="text-xs text-[var(--text-muted)]">
                        Protected System • Authorized Personnel Only
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
