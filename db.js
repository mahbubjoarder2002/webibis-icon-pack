const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    ssl: {
        rejectUnauthorized: false // Aiven ডাটাবেজের সিকিউর কানেকশনের জন্য এটি জরুরি
    }
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed: ❌', err.message);
    } else {
        console.log('Database Connected Successfully! 🚀 (Aiven Cloud)');
        
        // এখানে আইকন টেবিলটি স্বয়ংক্রিয়ভাবে তৈরি করার কোড দেওয়া হলো (যদি আগে থেকে না থাকে)
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