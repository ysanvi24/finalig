const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { resetLoginAttempts } = require('../middleware/securityMiddleware');

// @desc    Auth admin with username/password or student ID
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
    try {
        const { username, password, studentId } = req.body;

        // Check if database is connected
        const mongoose = require('mongoose');
        if (mongoose.connection.readyState !== 1) {
            console.error('LOGIN FAILED: MongoDB not connected! readyState:', mongoose.connection.readyState);
            return res.status(503).json({ 
                message: 'Database not connected. Check server terminal for errors.',
                hint: 'Your IP may not be whitelisted in MongoDB Atlas'
            });
        }

        // ── NoSQL Injection Guard: reject non-string inputs ──
        if (username && typeof username !== 'string') {
            return res.status(400).json({ message: 'Invalid input type for username' });
        }
        if (studentId && typeof studentId !== 'string') {
            return res.status(400).json({ message: 'Invalid input type for studentId' });
        }
        if (password && typeof password !== 'string') {
            return res.status(400).json({ message: 'Invalid input type for password' });
        }

        // Support both username and studentId login
        const loginId = studentId || username;
        
        if (!loginId || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }

        console.log('LOGIN attempt for:', loginId);

        const admin = await Admin.findOne({ 
            $or: [
                { username: loginId },
                { studentId: loginId },
                { email: loginId }
            ]
        }).select('+password');

        if (!admin) {
            console.log('LOGIN FAILED: No user found for:', loginId);
            return res.status(401).json({ message: 'Invalid credentials - user not found' });
        }

        // Check if account is active
        if (!admin.isActive) {
            console.log('LOGIN FAILED: Account suspended for:', loginId);
            return res.status(403).json({ 
                message: 'Account suspended',
                reason: admin.suspensionReason 
            });
        }

        // Verify password
        const isMatch = await admin.comparePassword(password);
        if (!isMatch) {
            console.log('LOGIN FAILED: Wrong password for:', loginId);
            return res.status(401).json({ message: 'Invalid credentials - wrong password' });
        }

        // Update login stats
        admin.lastLogin = new Date();
        admin.loginCount = (admin.loginCount || 0) + 1;
        await admin.save();

        // Reset brute-force counter on successful login
        const ip = req.ip || req.connection.remoteAddress;
        resetLoginAttempts(ip);

        console.log(`✅ LOGIN SUCCESS: ${loginId} (${admin.role}) from ${ip}`);

        res.json({
            _id: admin._id,
            studentId: admin.studentId,
            username: admin.username,
            email: admin.email,
            name: admin.name,
            role: admin.role,
            isTrusted: admin.isTrusted,
            permissions: admin.permissions,
            department: admin.department,
            profilePicture: admin.profilePicture,
            token: generateToken(admin._id),
            provider: 'local'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Google OAuth callback
// @route   POST /api/auth/google/callback
// @access  Public
const googleCallback = async (req, res) => {
    try {
        const { googleId, email, name, picture } = req.body;

        // SECURITY: Validate required fields from Google
        if (!googleId || !email) {
            return res.status(400).json({ message: 'Missing required Google profile data' });
        }

        // SECURITY: Sanitize inputs - prevent prototype pollution
        const safeGoogleId = String(googleId).substring(0, 100);
        const safeEmail = String(email).toLowerCase().substring(0, 254);
        const safeName = String(name || '').substring(0, 100);
        const safePicture = String(picture || '').substring(0, 500);

        let admin = await Admin.findOne({ googleId: safeGoogleId });

        if (!admin) {
            // Check if email is a VNIT student email
            const isVNITEmail = email?.match(/^[a-z]{2}\d{2}[a-z]{3}\d{3}@students\.vnit\.ac\.in$/);
            
            // Create new admin from Google profile
            admin = await Admin.create({
                googleId,
                email,
                name,
                profilePicture: picture,
                provider: 'google',
                verified: true,
                role: 'viewer', // New OAuth users start as viewers
                isTrusted: false // Must be verified by super_admin
            });
            
            // Extract student ID from VNIT email if applicable
            if (isVNITEmail) {
                const match = email.match(/\d{2}[a-z]{3}(\d{3})/);
                if (match) {
                    admin.studentId = match[1].padStart(5, '0');
                    await admin.save();
                }
            }
        } else {
            // Update profile info
            admin.name = name || admin.name;
            admin.profilePicture = picture || admin.profilePicture;
            admin.email = email || admin.email;
            admin.lastLogin = new Date();
            admin.loginCount = (admin.loginCount || 0) + 1;
            await admin.save();
        }

        // Check if account is active
        if (!admin.isActive) {
            return res.status(403).json({ 
                message: 'Account suspended',
                reason: admin.suspensionReason 
            });
        }

        res.json({
            _id: admin._id,
            studentId: admin.studentId,
            email: admin.email,
            name: admin.name,
            role: admin.role,
            isTrusted: admin.isTrusted,
            permissions: admin.permissions,
            profilePicture: admin.profilePicture,
            token: generateToken(admin._id),
            provider: 'google'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during Google login' });
    }
};

// @desc    Seed initial super admin
// @route   POST /api/auth/seed
// @access  RESTRICTED - only works if no super_admin exists yet
const seedAdmin = async (req, res) => {
    try {
        // SECURITY: Only allow seeding if absolutely no super_admin exists
        const superAdminCount = await Admin.countDocuments({ role: 'super_admin' });
        if (superAdminCount > 0) {
            return res.status(403).json({ message: 'Seed route disabled: admin already exists' });
        }

        // SECURITY: In production, require a seed secret from environment
        if (process.env.NODE_ENV === 'production') {
            const seedSecret = req.headers['x-seed-secret'];
            if (!seedSecret || seedSecret !== process.env.ADMIN_SEED_SECRET) {
                return res.status(403).json({ message: 'Invalid seed secret' });
            }
        }

        const admin = await Admin.create({
            username: 'admin',
            studentId: '00000',
            email: 'admin@vnit.ac.in',
            password: process.env.ADMIN_SEED_PASSWORD || 'admin123',
            name: 'VNIT Super Admin',
            provider: 'local',
            verified: true,
            role: 'super_admin',
            isTrusted: true
        });

        res.status(201).json({
            _id: admin._id,
            username: admin.username,
            email: admin.email,
            name: admin.name,
            role: admin.role,
            token: generateToken(admin._id),
            provider: 'local'
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Register new admin (for Google OAuth)
// @route   POST /api/auth/register-oauth
// @access  Public
const registerOAuth = async (req, res) => {
    try {
        const { googleId, email, name, picture } = req.body;

        // Check if admin with this email already exists
        let admin = await Admin.findOne({ email });

        if (admin) {
            // Link Google to existing account
            if (!admin.googleId) {
                admin.googleId = googleId;
                admin.provider = 'google';
                admin.profilePicture = picture || admin.profilePicture;
                await admin.save();
            }
            return res.json({
                _id: admin._id,
                email: admin.email,
                name: admin.name,
                role: admin.role,
                isTrusted: admin.isTrusted,
                profilePicture: admin.profilePicture,
                token: generateToken(admin._id),
                provider: 'google',
                message: 'Logged in successfully'
            });
        }

        // Create new admin
        admin = await Admin.create({
            googleId,
            email,
            name,
            profilePicture: picture,
            provider: 'google',
            verified: true,
            role: 'viewer', // Start as viewer
            isTrusted: false
        });

        res.status(201).json({
            _id: admin._id,
            email: admin.email,
            name: admin.name,
            role: admin.role,
            isTrusted: admin.isTrusted,
            profilePicture: admin.profilePicture,
            token: generateToken(admin._id),
            provider: 'google',
            message: 'Account created successfully. Contact admin to get trusted status.'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during registration' });
    }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    try {
        const admin = await Admin.findById(req.admin._id)
            .populate('department', 'name shortCode logo')
            .populate('lockedMatches.match', 'sport teamA teamB status')
            .select('-password');
        
        res.json({
            success: true,
            data: admin
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update current user profile
// @route   PUT /api/auth/me
// @access  Private
const updateMe = async (req, res) => {
    try {
        const { name, phone, profilePicture } = req.body;
        
        const admin = await Admin.findById(req.admin._id);
        
        if (name) admin.name = name;
        if (phone !== undefined) admin.phone = phone;
        if (profilePicture) admin.profilePicture = profilePicture;
        
        await admin.save();
        
        res.json({
            success: true,
            data: admin.getPublicProfile()
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        
        const admin = await Admin.findById(req.admin._id).select('+password');
        
        if (!admin.password) {
            return res.status(400).json({ 
                message: 'Cannot change password for OAuth accounts' 
            });
        }
        
        const isMatch = await admin.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }
        
        admin.password = newPassword;
        await admin.save();
        
        res.json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const generateToken = (id) => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('FATAL: JWT_SECRET environment variable is not set');
    }
    return jwt.sign({ id }, secret, {
        expiresIn: '30d'
    });
};

module.exports = {
    login,
    googleCallback,
    registerOAuth,
    seedAdmin,
    getMe,
    updateMe,
    changePassword
};
