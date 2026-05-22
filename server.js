const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const db = require('./db');
const buildFont = require('./generate-font');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Dist ফোল্ডারটি নিশ্চিত করা (সার্ভার স্টার্ট হওয়ার সময়)
const distDir = path.join(__dirname, 'public', 'dist');
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
}
app.use('/dist', express.static(distDir));
app.use(express.static(path.join(__dirname, 'public')));

// সার্ভার স্টার্ট হওয়ার সময় একবার ফন্ট বিল্ড করা (যাতে ডিস্ট ফোল্ডার এম্পটি না থাকে)
buildFont().then(success => {
    if (success) console.log("Initial font build completed successfully.");
    else console.log("Initial font build failed or no icons found.");
});

// ১. আইকন যোগ API
app.post('/api/icons/add', async (req, res) => {
    try {
        const { icon_name, category, style, svg_code, tags } = req.body;
        if (!icon_name || !category || !svg_code) {
            return res.status(400).json({ success: false, message: 'Missing required fields!' });
        }

        await db.query(`INSERT INTO icons (icon_name, category, style, svg_code, tags) VALUES (?, ?, ?, ?, ?)`, 
                        [icon_name, category, style || 'regular', svg_code, tags || '']);

        const isBuilt = await buildFont(); 
        res.status(201).json({ success: true, message: isBuilt ? 'Icon saved and font updated! 🎉' : 'Icon saved, but build failed.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
});

// ২. সব আইকন গেট API
app.get('/api/icons/all', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT id, icon_name, category, style, tags FROM icons');
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
});

// ৩. SVG কোড API
app.get('/api/icons/svg/:id', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT svg_code FROM icons WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).send('Not found');
        res.setHeader('Content-Type', 'image/svg+xml');
        res.send(rows[0].svg_code);
    } catch (error) {
        res.status(500).send('Server Error');
    }
});

// ৪. ডিলিট API
app.delete('/api/icons/delete/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM icons WHERE id = ?', [req.params.id]);
        await buildFont(); 
        res.status(200).json({ success: true, message: 'Icon deleted!' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT} 🚀`);
});