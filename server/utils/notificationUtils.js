const pool = require('../config/db');
const { sendLowStockAlert, sendOverdueReminder } = require('../templates/emails');

const shouldSendEmail = async (userId, type) => {
  const [prefs] = await pool.query(
    `SELECT * FROM notification_preferences WHERE user_id = ?`,
    [userId]
  );
  if (!prefs || !prefs.length) return true; // Default to send all if missing

  const prefMap = {
    low_stock: prefs[0].low_stock_email,
    purchase_update: prefs[0].purchase_updates,
    bill_issued: prefs[0].bill_issued,
    bill_overdue: prefs[0].bill_overdue,
    payment: prefs[0].payment_received,
    system: prefs[0].system_updates,
  };
  return prefMap[type] ?? true;
};

const getLowStockProducts = async () => {
  const [products] = await pool.query(
    `SELECT p.*, w.name as workspace_name 
     FROM products p
     JOIN workspaces w ON p.workspace_id = w.id
     WHERE p.stock_quantity <= p.min_stock_level`
  );
  return products;
};

const getAdminsAndStaff = async () => {
  const [users] = await pool.query(
    `SELECT u.id, u.name, u.email, u.role, GROUP_CONCAT(wu.workspace_id) as workspaces
     FROM users u
     LEFT JOIN workspace_users wu ON u.id = wu.user_id
     WHERE u.role IN ('admin', 'staff') AND u.is_active = TRUE AND u.email_verified = TRUE
     GROUP BY u.id`
  );
  return users.map(u => ({
    ...u,
    workspaces: u.workspaces ? u.workspaces.split(',').map(id => parseInt(id, 10)) : []
  }));
};

const getOverdueBills = async () => {
  const [bills] = await pool.query(
    `SELECT b.*, w.name as workspace_name, c.name as customer_name, c.email as customer_email
     FROM bills b
     JOIN workspaces w ON b.workspace_id = w.id
     JOIN users c ON b.customer_id = c.id
     WHERE b.status IN ('issued', 'partial') AND b.due_date < NOW()`
  );
  return bills.map(b => ({
    ...b,
    outstanding: parseFloat(b.total_amount) - parseFloat(b.paid_amount)
  }));
};

module.exports = {
  shouldSendEmail,
  getLowStockProducts,
  getAdminsAndStaff,
  getOverdueBills
};
