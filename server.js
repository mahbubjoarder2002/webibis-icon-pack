const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const db = require('./db'); // db.js লিঙ্ক
const buildFont = require('./generate-font'); // ফন্ট বিল্ড ফাংশন

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ১. নতুন আইকন আপলোড এবং অটো-ফন্ট বিল্ড API (POST Request)
app.post('/api/icons/add', async (req, res) => {
    try {
        const { icon_name, category, style, svg_code, tags } = req.body;

        if (!icon_name || !category || !svg_code) {
            return res.status(400).json({ success: false, message: 'Name, Category and SVG Code are required!' });
        }

        const query = `INSERT INTO icons (icon_name, category, style, svg_code, tags) VALUES (?, ?, ?, ?, ?)`;
        await db.query(query, [icon_name, category, style || 'regular', svg_code, tags || '']);

        console.log('New icon saved! Triggering auto-build... ⚙️');
        const isBuilt = await buildFont(); 

        if (isBuilt) {
            res.status(201).json({ success: true, message: 'Icon saved and Web Font updated automatically! 🎉🚀' });
        } else {
            res.status(201).json({ success: true, message: 'Icon saved, but automatic font build had a minor issue.' });
        }
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ success: false, message: 'An icon with this name already exists!' });
        }
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
});

// ২. সব আইকন ডাটাবেজ থেকে গেট (GET) করার API
app.get('/api/icons/all', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT id, icon_name, category, style, tags FROM icons');
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
});

// ৩. নির্দিষ্ট আইকনের SVG কোড পাওয়ার জন্য API
app.get('/api/icons/svg/:id', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT svg_code FROM icons WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).send('Icon not found');
        
        res.setHeader('Content-Type', 'image/svg+xml');
        res.send(rows[0].svg_code);
    } catch (error) {
        res.status(500).send('Server Error');
    }
});

// ৪. আইকন ডিলিট করার API (নতুন)
app.delete('/api/icons/delete/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM icons WHERE id = ?', [id]);
        
        // ডিলিট করার পরেও ফন্ট আপডেট করে নেয়া ভালো
        await buildFont(); 
        
        res.status(200).json({ success: true, message: 'Icon deleted successfully!' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
});

// Base Route
app.get('/', (req, res) => {
    res.send('Webibis Icon Pack API is running...');
});

// Server Listen
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT} 🚀`);
});