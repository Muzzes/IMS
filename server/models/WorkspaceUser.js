const pool = require('../config/db');

class WorkspaceUser {
  static async assign({ workspace_id, user_id, access_level = 'full', assigned_by }) {
    await pool.query(
      `INSERT INTO workspace_users (workspace_id, user_id, access_level, assigned_by)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE access_level = VALUES(access_level), assigned_by = VALUES(assigned_by), assigned_at = CURRENT_TIMESTAMP`,
      [workspace_id, user_id, access_level, assigned_by]
    );
    return this.getByWorkspaceAndUser(workspace_id, user_id);
  }

  static async revoke(workspace_id, user_id) {
    const [result] = await pool.query(
      'DELETE FROM workspace_users WHERE workspace_id = ? AND user_id = ?',
      [workspace_id, user_id]
    );
    return result.affectedRows > 0;
  }

  static async getByWorkspace(workspace_id) {
    const [rows] = await pool.query(
      `SELECT wu.*, u.name AS user_name, u.email AS user_email, u.role AS user_role
       FROM workspace_users wu
       JOIN users u ON u.id = wu.user_id
       WHERE wu.workspace_id = ?
       ORDER BY wu.assigned_at DESC`,
      [workspace_id]
    );
    return rows;
  }

  static async getByUser(user_id) {
    const [rows] = await pool.query(
      `SELECT wu.*, w.name AS workspace_name, w.description, w.logo_url, w.color
       FROM workspace_users wu
       JOIN workspaces w ON w.id = wu.workspace_id
       WHERE wu.user_id = ? AND w.is_archived = FALSE
       ORDER BY w.name`,
      [user_id]
    );
    return rows;
  }

  static async getByWorkspaceAndUser(workspace_id, user_id) {
    const [rows] = await pool.query(
      `SELECT wu.*, u.name AS user_name, u.email AS user_email, u.role AS user_role
       FROM workspace_users wu
       JOIN users u ON u.id = wu.user_id
       WHERE wu.workspace_id = ? AND wu.user_id = ?`,
      [workspace_id, user_id]
    );
    return rows[0] || null;
  }

  static async updateAccessLevel(workspace_id, user_id, access_level) {
    await pool.query(
      'UPDATE workspace_users SET access_level = ? WHERE workspace_id = ? AND user_id = ?',
      [access_level, workspace_id, user_id]
    );
    return this.getByWorkspaceAndUser(workspace_id, user_id);
  }

  static async getAllUsersWithWorkspaceAccess(workspace_id) {
    const [rows] = await pool.query(
      `SELECT u.id, u.name, u.email, u.role, u.is_active,
              wu.access_level, wu.assigned_at,
              CASE WHEN wu.id IS NOT NULL THEN TRUE ELSE FALSE END AS has_access
       FROM users u
       LEFT JOIN workspace_users wu ON wu.user_id = u.id AND wu.workspace_id = ?
       WHERE u.role != 'admin'
       ORDER BY u.name`,
      [workspace_id]
    );
    return rows;
  }
}

module.exports = WorkspaceUser;
