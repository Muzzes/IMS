const pool = require('../config/db');

const notificationPrefController = {
  getPreferences: async (req, res) => {
    try {
      const [rows] = await pool.query(
        `SELECT * FROM notification_preferences WHERE user_id = ?`,
        [req.user.id]
      );
      // If no row exists yet, return defaults
      if (!rows.length) {
        return res.json({
          preferences: {
            low_stock_email: true,
            purchase_updates: true,
            bill_issued: true,
            bill_overdue: true,
            payment_received: true,
            system_updates: false,
            digest_frequency: 'instant'
          }
        });
      }
      const { id, user_id, updated_at, ...prefs } = rows[0];
      res.json({ preferences: prefs });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error.' });
    }
  },

  updatePreferences: async (req, res) => {
    try {
      const { low_stock_email, purchase_updates, bill_issued, bill_overdue, payment_received, system_updates, digest_frequency } = req.body;

      await pool.query(
        `INSERT INTO notification_preferences
          (user_id, low_stock_email, purchase_updates, bill_issued, bill_overdue, payment_received, system_updates, digest_frequency, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
         ON DUPLICATE KEY UPDATE
          low_stock_email = VALUES(low_stock_email),
          purchase_updates = VALUES(purchase_updates),
          bill_issued = VALUES(bill_issued),
          bill_overdue = VALUES(bill_overdue),
          payment_received = VALUES(payment_received),
          system_updates = VALUES(system_updates),
          digest_frequency = VALUES(digest_frequency),
          updated_at = NOW()`,
        [req.user.id, low_stock_email, purchase_updates, bill_issued, bill_overdue, payment_received, system_updates, digest_frequency || 'instant']
      );

      res.json({ message: 'Preferences saved.' });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error.' });
    }
  }
};

module.exports = notificationPrefController;
