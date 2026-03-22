const pool = require('../config/db');
const { getPagination, paginatedResponse } = require('../utils/helpers');

class Supplier {
  static async getAll(workspaceId, query = {}) {
    const { page, limit, offset } = getPagination(query);
    let where = 'WHERE 1=1';
    const params = [];

    if (workspaceId) {
      where += ' AND workspace_id = ?';
      params.push(workspaceId);
    }
    if (query.search) {
      where += ' AND (name LIKE ? OR email LIKE ?)';
      params.push(`%${query.search}%`, `%${query.search}%`);
    }

    const [rows] = await pool.query(
      `SELECT * FROM suppliers ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM suppliers ${where}`, params);
    return paginatedResponse(rows, total, page, limit);
  }

  static async getById(id) {
    const [rows] = await pool.query('SELECT * FROM suppliers WHERE id = ?', [id]);
    return rows[0] || null;
  }

  static async create(data) {
    const [result] = await pool.query(
      'INSERT INTO suppliers (workspace_id, name, email, phone, address) VALUES (?, ?, ?, ?, ?)',
      [data.workspace_id, data.name, data.email || null, data.phone || null, data.address || null]
    );
    return this.getById(result.insertId);
  }

  static async update(id, data) {
    const allowed = ['name', 'email', 'phone', 'address', 'is_active'];
    const updates = [];
    const values = [];
    for (const key of allowed) {
      if (data[key] !== undefined) {
        updates.push(`${key} = ?`);
        values.push(data[key]);
      }
    }
    if (updates.length === 0) return null;
    values.push(id);
    await pool.query(`UPDATE suppliers SET ${updates.join(', ')} WHERE id = ?`, values);
    return this.getById(id);
  }

  static async delete(id) {
    const [result] = await pool.query('DELETE FROM suppliers WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = Supplier;
