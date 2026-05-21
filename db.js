const mysql = require('mysql2');
// রেন্ডার ক্লাউডের এনভায়রনমেন্ট ভ্যারিয়েবল রিড করার জন্য এটি একদম ওপরে জরুরি
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
        console.log('Database Connected Successfully! 🚀 (Aiven Cloud)');
    }
});

module.exports = db;