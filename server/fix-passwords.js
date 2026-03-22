require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function fix() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ims_db'
  });

  const hash = await bcrypt.hash('password123', 10);
  await pool.query('UPDATE users SET password = ?', [hash]);
  console.log('updated passwords to password123. Hash:', hash);
  process.exit(0);
}
fix();
