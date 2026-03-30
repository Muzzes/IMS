const pool = require('../config/db');

const emailLogController = {
  getAll: async (req, res) => {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 30;
      const offset = (page - 1) * limit;

      let where = 'WHERE 1=1';
      const params = [];

      if (req.query.status) {
        where += ' AND status = ?';
        params.push(req.query.status);
      }
      if (req.query.type) {
        where += ' AND type = ?';
        params.push(req.query.type);
      }
      if (req.query.date_from) {
        where += ' AND sent_at >= ?';
        params.push(req.query.date_from);
      }
      if (req.query.date_to) {
        where += ' AND sent_at <= ?';
        params.push(req.query.date_to + ' 23:59:59');
      }

      const [rows] = await pool.query(
        `SELECT el.*, u.name as user_name FROM email_logs el
         LEFT JOIN users u ON u.id = el.user_id
         ${where} ORDER BY el.sent_at DESC LIMIT ? OFFSET ?`,
        [...params, limit, offset]
      );
      const [[{ total }]] = await pool.query(
        `SELECT COUNT(*) as total FROM email_logs ${where}`, params
      );

      res.json({ data: rows, total, page, limit, pages: Math.ceil(total / limit) });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error.' });
    }
  }
};

module.exports = emailLogController;
