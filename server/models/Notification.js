const pool = require('../config/db');

class Notification {
  static async create({ workspace_id, user_id, title, message, type = 'info', link }) {
    const [result] = await pool.query(
      'INSERT INTO notifications (workspace_id, user_id, title, message, type, link) VALUES (?, ?, ?, ?, ?, ?)',
      [workspace_id || null, user_id, title, message || null, type, link || null]
    );
    return { id: result.insertId, workspace_id, user_id, title, message, type, link };
  }

  static async getByUser(userId, workspaceId, { limit = 20, unreadOnly = false } = {}) {
    let where = 'WHERE n.user_id = ?';
    const params = [userId];
    if (workspaceId) {
      where += ' AND (n.workspace_id = ? OR n.workspace_id IS NULL)';
      params.push(workspaceId);
    }
    if (unreadOnly) {
      where += ' AND n.is_read = FALSE';
    }
    const [rows] = await pool.query(
      `SELECT n.* FROM notifications n ${where} ORDER BY n.created_at DESC LIMIT ?`,
      [...params, limit]
    );
    return rows;
  }

  static async getUnreadCount(userId, workspaceId) {
    let where = 'WHERE user_id = ? AND is_read = FALSE';
    const params = [userId];
    if (workspaceId) {
      where += ' AND (workspace_id = ? OR workspace_id IS NULL)';
      params.push(workspaceId);
    }
    const [[{ count }]] = await pool.query(`SELECT COUNT(*) as count FROM notifications ${where}`, params);
    return count;
  }

  static async markRead(id, userId) {
    await pool.query('UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?', [id, userId]);
  }

  static async markAllRead(userId, workspaceId) {
    let where = 'WHERE user_id = ? AND is_read = FALSE';
    const params = [userId];
    if (workspaceId) {
      where += ' AND (workspace_id = ? OR workspace_id IS NULL)';
      params.push(workspaceId);
    }
    await pool.query(`UPDATE notifications SET is_read = TRUE ${where}`, params);
  }
}

module.exports = Notification;
