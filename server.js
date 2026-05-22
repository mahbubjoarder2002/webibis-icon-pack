const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const db = require('./db');
const buildFont = require('./generate-font');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key';

// Middleware
app.use(cors());
app.use(express.json());

// Auth Middleware (যেখানে কপি করার জন্য লগইন চেক দরকার)
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).json({ success: false, message: 'No token provided!' });
    
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ success: false, message: 'Failed to authenticate token.' });
        req.userId = decoded.id;
        next();
    });
};

// --- AUTH ROUTES ---

// রেজিস্ট্রেশন
app.post('/api/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.query('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, hashedPassword]);
        res.status(201).json({ success: true, message: 'User registered successfully!' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Registration failed', error: error.message });
    }
});

// লগইন
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) return res.status(404).json({ success: false, message: 'User not found' });
        
        const isMatch = await bcrypt.compare(password, users[0].password);
        if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid password' });
        
        const token = jwt.sign({ id: users[0].id }, JWT_SECRET, { expiresIn: '24h' });
        res.status(200).json({ success: true, token });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Login failed', error: error.message });
    }
});

// --- EXISTING ROUTES ---

app.use('/dist', express.static(path.join(__dirname, 'public', 'dist')));
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/icons/add', async (req, res) => {
    try {
        const { icon_name, category, svg_code } = req.body;
        await db.query(`INSERT INTO icons (icon_name, category, svg_code) VALUES (?, ?, ?)`, [icon_name, category, svg_code]);
        await buildFont();
        res.status(201).json({ success: true, message: 'Icon saved!' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error', error: error.message });
    }
});

app.get('/api/icons/all', async (req, res) => {
    const [rows] = await db.query('SELECT id, icon_name, category FROM icons');
    res.status(200).json({ success: true, data: rows });
});

app.get('/api/icons/svg/:id', async (req, res) => {
    const [rows] = await db.query('SELECT svg_code FROM icons WHERE id = ?', [req.params.id]);
    res.setHeader('Content-Type', 'image/svg+xml');
    res.send(rows[0].svg_code);
});

// প্রোটেক্টেড কপি রাউট (যদি আপনার কপি করার জন্য কোনো এপিআই কল থাকে)
app.get('/api/icons/download/:id', verifyToken, (req, res) => {
    res.json({ success: true, message: 'Authorized to copy!' });
});

app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT} 🚀`));