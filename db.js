const mysql = require('mysql2/promise'); // প্রমিজ-বেজড ড্রাইভার ব্যবহার করা হলো
require('dotenv').config();

// Pool ব্যবহার করা হলো যাতে ডাটাবেজ কানেকশনগুলো সার্ভার ম্যানেজ করতে পারে
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 21748,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: {
        rejectUnauthorized: false
    }
});

async function initializeDatabase() {
    try {
        // ডাটাবেজ কানেকশন টেস্ট
        const connection = await pool.getConnection();
        console.log('Database Connected Successfully! 🚀 (Aiven Cloud - Authorized)');
        
        // টেবিল চেক বা তৈরি করার কুয়েরি
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
        
        await connection.query(createTableQuery);
        console.log('Icons Table Checked/Created Successfully! 📊');
        
        // কানেকশন রিলিজ করা
        connection.release();
    } catch (err) {
        console.error('Database setup failed: ❌', err.message);
    }
}

// ফাংশনটি কল করা
initializeDatabase();

module.exports = pool;