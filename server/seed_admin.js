const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function seedAdmin() {
  const conn = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'RootPass2024!'
  });
  try {
    // Create restricted app user
    await conn.query("CREATE USER IF NOT EXISTS 'stockflow_app'@'localhost' IDENTIFIED BY 'secure_dev_password';");
    await conn.query("GRANT SELECT, INSERT, UPDATE, DELETE, EXECUTE ON stockflow_ims.* TO 'stockflow_app'@'localhost';");
    await conn.query("FLUSH PRIVILEGES;");
    console.log("stockflow_app user created");

    // Seed first admin
    const password = "StockFlowAdmin2024!";
    const hash = await bcrypt.hash(password, 12);
    await conn.query("USE stockflow_ims;");
    const [r] = await conn.query(
      "INSERT IGNORE INTO users (name, email, password_hash, role, status, email_verified) VALUES ('System Admin', 'admin@stockflow.com', ?, 'admin', 'active', TRUE);",
      [hash]
    );
    const adminId = r.insertId || 1;
    const [ws] = await conn.query(
      "INSERT IGNORE INTO workspaces (name, description, color, created_by) VALUES ('Main Workspace', 'Default production workspace', '#818cf8', ?);",
      [adminId]
    );
    const wsId = ws.insertId || 1;
    await conn.query(
      "INSERT IGNORE INTO workspace_users (workspace_id, user_id, access_level) VALUES (?, ?, 'full');",
      [wsId, adminId]
    );
    console.log("==========================================");
    console.log("SEED COMPLETE");
    console.log("Admin Email:    admin@stockflow.com");
    console.log("Admin Password: " + password);
    console.log("==========================================");
  } catch(e) {
    console.error("SEED FAILED:", e.sqlMessage || e.message);
  } finally {
    await conn.end();
  }
}

seedAdmin();
