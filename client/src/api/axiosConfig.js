import axios from 'axios';
import { toast } from 'react-hot-toast';

// Use relative URL for same-origin requests, supports both dev and production
// In development, proxy handles /api -> localhost:5000/api
const API_URL = import.meta.env.VITE_API_URL || '/api';
const ADMIN_SECRET_PATH = import.meta.env.VITE_ADMIN_SECRET_PATH || 'shashwatam-control-2026';

const api = axios.create({
    baseURL: API_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor - add token to headers
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('adminToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - handle token expiration and errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Don't redirect if already on login page or auth routes
        const isAuthRoute = window.location.pathname.includes('/login');
        
        if (error.response?.status === 401) {
            // Token expired or invalid
            console.log('🔒 401 Unauthorized - Clearing session');
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminUser');
            localStorage.removeItem('sessionFingerprint');
            localStorage.removeItem('sessionStart');
            
            if (!isAuthRoute) {
                // Redirect to secret login path
                window.location.href = `/${ADMIN_SECRET_PATH}/login`;
                toast.error('Session expired. Please login again.');
            }
        } else if (error.response?.status === 403) {
            console.log('🚫 403 Forbidden:', error.response?.data?.message);
            toast.error(error.response?.data?.message || 'You do not have permission to perform this action');
        } else if (error.response?.status === 502) {
            toast.error('Server temporarily unavailable. Please try again.');
            console.error('502 Bad Gateway - Server may be restarting or overloaded');
        } else if (error.response?.status === 500) {
            console.error('500 Server Error:', error.response?.data);
            toast.error('Server error. Please try again later.');
        } else if (error.code === 'ECONNABORTED' || error.message === 'timeout of 30000ms exceeded') {
            toast.error('Request timeout. Please check your connection.');
        }
        return Promise.reject(error);
    }
);

export default api;
