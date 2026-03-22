const pool = require('../config/db');
const { getPagination, paginatedResponse } = require('../utils/helpers');

class Product {
  static async getAll(workspaceId, query = {}) {
    const { page, limit, offset } = getPagination(query);
    let where = 'WHERE 1=1';
    const params = [];

    if (workspaceId) {
      where += ' AND p.workspace_id = ?';
      params.push(workspaceId);
    }
    if (query.category) {
      where += ' AND p.category = ?';
      params.push(query.category);
    }
    if (query.search) {
      where += ' AND (p.name LIKE ? OR p.sku LIKE ?)';
      params.push(`%${query.search}%`, `%${query.search}%`);
    }
    if (query.manufacturer_id) {
      where += ' AND p.manufacturer_id = ?';
      params.push(query.manufacturer_id);
    }
    if (query.low_stock === 'true') {
      where += ' AND p.stock_quantity <= p.min_stock_level';
    }

    const [rows] = await pool.query(
      `SELECT p.*, s.name AS supplier_name, u.name AS manufacturer_name
       FROM products p
       LEFT JOIN suppliers s ON s.id = p.supplier_id
       LEFT JOIN users u ON u.id = p.manufacturer_id
       ${where}
       ORDER BY p.created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM products p ${where}`, params
    );

    return paginatedResponse(rows, total, page, limit);
  }

  static async getById(id) {
    const [rows] = await pool.query(
      `SELECT p.*, s.name AS supplier_name, u.name AS manufacturer_name
       FROM products p
       LEFT JOIN suppliers s ON s.id = p.supplier_id
       LEFT JOIN users u ON u.id = p.manufacturer_id
       WHERE p.id = ?`, [id]
    );
    return rows[0] || null;
  }

  static async create(data) {
    const [result] = await pool.query(
      `INSERT INTO products (workspace_id, name, sku, description, category, unit_price, cost_price, stock_quantity, min_stock_level, supplier_id, manufacturer_id, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [data.workspace_id, data.name, data.sku || null, data.description || null, data.category || null,
       data.unit_price || 0, data.cost_price || 0, data.stock_quantity || 0, data.min_stock_level || 10,
       data.supplier_id || null, data.manufacturer_id || null, data.image_url || null]
    );
    return this.getById(result.insertId);
  }

  static async update(id, data) {
    const allowed = ['name', 'sku', 'description', 'category', 'unit_price', 'cost_price',
                     'stock_quantity', 'min_stock_level', 'supplier_id', 'manufacturer_id', 'image_url', 'is_active'];
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
    await pool.query(`UPDATE products SET ${updates.join(', ')} WHERE id = ?`, values);
    return this.getById(id);
  }

  static async delete(id) {
    const [result] = await pool.query('DELETE FROM products WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  static async adjustStock(id, quantityChange) {
    await pool.query(
      'UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?',
      [quantityChange, id]
    );
    return this.getById(id);
  }

  static async getCategories(workspaceId) {
    let query = 'SELECT DISTINCT category FROM products WHERE category IS NOT NULL';
    const params = [];
    if (workspaceId) {
      query += ' AND workspace_id = ?';
      params.push(workspaceId);
    }
    const [rows] = await pool.query(query + ' ORDER BY category', params);
    return rows.map(r => r.category);
  }
}

module.exports = Product;
