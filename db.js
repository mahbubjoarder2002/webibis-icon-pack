const mysql = require('mysql2');
// রেন্ডারের এনভায়রনমেন্ট ভ্যারিয়েবল পড়ার জন্য এটি সবার ওপরে থাকা বাধ্যতামূলক
require('dotenv').config();

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 21748,
    ssl: {
        rejectUnauthorized: false
    }
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed: ❌', err.message);
    } else {
        console.log('Database Connected Successfully! 🚀 (Aiven Cloud - Authorized)');
        
        // অটোমেটিক টেবিল তৈরি করার কুয়েরি
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS icons (
                id INT AUTO_INCREMENT PRIMARY KEY,
                icon_name VARCHAR(255) NOT NULL,
                category VARCHAR(255) NOT NULL,
                style VARCHAR(50) DEFAULT 'regular',
                tags TEXT,
                svg_code TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;
        db.query(createTableQuery, (tableErr) => {
            if (tableErr) {
                console.error('Table creation error: ❌', tableErr.message);
            } else {
                console.log('Icons Table Checked/Created Successfully! 📊');
            }
        });
    }
});

module.exports = db;