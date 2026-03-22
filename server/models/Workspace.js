const pool = require('../config/db');

class Workspace {
  static async create({ name, description, logo_url, color }) {
    const [result] = await pool.query(
      'INSERT INTO workspaces (name, description, logo_url, color) VALUES (?, ?, ?, ?)',
      [name, description || null, logo_url || null, color || '#6366f1']
    );
    return this.getById(result.insertId);
  }

  static async getAll() {
    const [rows] = await pool.query(
      `SELECT w.*, 
        (SELECT COUNT(*) FROM workspace_users wu WHERE wu.workspace_id = w.id) AS user_count,
        (SELECT COUNT(*) FROM products p WHERE p.workspace_id = w.id) AS product_count
       FROM workspaces w WHERE w.is_archived = FALSE ORDER BY w.created_at DESC`
    );
    return rows;
  }

  static async getById(id) {
    const [rows] = await pool.query(
      `SELECT w.*, 
        (SELECT COUNT(*) FROM workspace_users wu WHERE wu.workspace_id = w.id) AS user_count,
        (SELECT COUNT(*) FROM products p WHERE p.workspace_id = w.id) AS product_count
       FROM workspaces w WHERE w.id = ?`, [id]
    );
    return rows[0] || null;
  }

  static async update(id, fields) {
    const allowed = ['name', 'description', 'logo_url', 'color', 'is_archived'];
    const updates = [];
    const values = [];
    for (const key of allowed) {
      if (fields[key] !== undefined) {
        updates.push(`${key} = ?`);
        values.push(fields[key]);
      }
    }
    if (updates.length === 0) return null;
    values.push(id);
    await pool.query(`UPDATE workspaces SET ${updates.join(', ')} WHERE id = ?`, values);
    return this.getById(id);
  }

  static async delete(id) {
    const [result] = await pool.query('DELETE FROM workspaces WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = Workspace;
