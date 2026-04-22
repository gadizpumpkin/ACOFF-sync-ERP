// backend/config/db.js

const mysql = require("mysql2/promise");

const db = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "coffe_street",
  port: 3306,

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// TEST KONEKSI SAAT SERVER START
(async () => {
  try {
    const conn = await db.getConnection();
    console.log("DATABASE CONNECTED");
    conn.release();
  } catch (err) {
    console.error("❌ DATABASE ERROR:", err);
  }
})();

module.exports = db;