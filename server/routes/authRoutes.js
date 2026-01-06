const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const AdminUser = require('../schemas/AdminUser');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'dev_super_secret_change_me';
// "Forever" for now: set very long expiry (10 years). You can reduce later.
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '3650d';

// POST /api/v1/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const admin = await AdminUser.findOne({ email: email.toLowerCase().trim() });
        if (!admin) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, admin.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            {
                id: admin._id.toString(),
                email: admin.email,
                role: admin.role
            },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        res.json({
            token,
            user: {
                id: admin._id,
                email: admin.email,
                role: admin.role,
                name: 'Admin'
            }
        });
    } catch (err) {
        console.error('Error in /auth/login:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;


