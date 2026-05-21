const mysql = require('mysql2');
// রেন্ডার বা ক্লাউড সার্ভারের এনভায়রনমেন্ট ভ্যারিয়েবল রিড করার জন্য এটি একদম ওপরে থাকতে হবে
require('dotenv').config();

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD, // পাসওয়ার্ডটি এখন সম্পূর্ণ সুরক্ষিত ও হাইড করা
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 21748,
    ssl: {
        rejectUnauthorized: false // Aiven ক্লাউডের সিকিউর কানেকশনের জন্য আবশ্যক
    }
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed: ❌', err.message);
    } else {
        console.log('Database Connected Successfully! 🚀 (Aiven Cloud - Secure Mode)');
        
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
            if (tableErr) console.error('Table creation error:', tableErr.message);
        });
    }
});

module.exports = db;