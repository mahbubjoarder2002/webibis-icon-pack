const mysql = require('mysql2');

// কোনো .env ফাইল ছাড়া সরাসরি আইভেন ক্লাউড ডাটাবেজ কানেকশন
const db = mysql.createConnection({
    host: 'mysql-195c6f94-webibis-icon-pack.i.aivencloud.com',
    user: 'avnadmin',
    password: 'AVNS_AUAe9lWQGKZqfjvQ7QY',
    database: 'defaultdb',
    port: 21748,
    ssl: {
        rejectUnauthorized: false
    }
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed: ❌', err.message);
    } else {
        console.log('Database Connected Successfully! 🚀 (Aiven Cloud - Hardcoded)');
        
        // টেবিল তৈরি করার কুয়েরি
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