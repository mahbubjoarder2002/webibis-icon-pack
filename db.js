const mysql = require('mysql2');
require('dotenv').config();

// ডাটাবেজ কানেকশন পুল তৈরি করা
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// কানেকশন ঠিকঠাক আছে কিনা তা চেক করার জন্য একটি টেস্ট প্রমিজ
const db = pool.promise();

db.getConnection()
    .then(connection => {
        console.log('InfinityFree MySQL Database connected successfully! 🚀');
        connection.release();
    })
    .catch(err => {
        console.error('Database connection failed: ❌', err.message);
    });

module.exports = db;