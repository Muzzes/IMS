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
    await pool.query("UPDATE purchases SET status = 'pending' WHERE status = 'ordered'");
    console.log("Migrated 'ordered' -> 'pending'");
    await pool.query("ALTER TABLE purchases MODIFY COLUMN status ENUM('draft','pending','delivering','delivered','received','cancelled') NOT NULL DEFAULT 'draft'");
    console.log("Migration successful: Added 'delivered' and dropped 'ordered' from schema");
  } catch (err) {
    console.error("Migration sqlMessage:", err.sqlMessage || err.message);
  } finally {
    process.exit(0);
  }
}
main();
