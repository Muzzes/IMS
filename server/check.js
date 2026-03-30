require('dotenv').config();
const mysql = require('mysql2/promise');

async function main() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ims_db'
  });
  const [rows] = await pool.query('SELECT DISTINCT status FROM purchases');
  console.log('Current statuses in DB:', rows);
  process.exit(0);
}
main();
