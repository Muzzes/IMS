require('dotenv').config();
const mysql = require('mysql2/promise');

async function main() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ims_db'
  });

  try {
    await pool.query("ALTER TABLE purchases MODIFY COLUMN status ENUM('draft','ordered','pending','delivering','delivered','received','cancelled') NOT NULL DEFAULT 'draft'");
    console.log("Migration successful");
  } catch (err) {
    console.log("FAILED WITH ERR:", err);
  } finally {
    process.exit(0);
  }
}
main();
