const pool = require('../config/db');
const { getPagination, paginatedResponse, generateRefNumber } = require('../utils/helpers');

class Purchase {
  static async getAll(workspaceId, query = {}) {
    const { page, limit, offset } = getPagination(query);
    let where = 'WHERE 1=1';
    const params = [];

    if (workspaceId) {
      where += ' AND p.workspace_id = ?';
      params.push(workspaceId);
    }
    if (query.status) {
      where += ' AND p.status = ?';
      params.push(query.status);
    }
    if (query.supplier_id) {
      where += ' AND p.supplier_id = ?';
      params.push(query.supplier_id);
    }

    const [rows] = await pool.query(
      `SELECT p.*, s.name AS supplier_name, u.name AS created_by_name
       FROM purchases p
       LEFT JOIN suppliers s ON s.id = p.supplier_id
       LEFT JOIN users u ON u.id = p.created_by
       ${where}
       ORDER BY p.created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM purchases p ${where}`, params);
    return paginatedResponse(rows, total, page, limit);
  }

  static async getById(id) {
    const [rows] = await pool.query(
      `SELECT p.*, s.name AS supplier_name, u.name AS created_by_name
       FROM purchases p
       LEFT JOIN suppliers s ON s.id = p.supplier_id
       LEFT JOIN users u ON u.id = p.created_by
       WHERE p.id = ?`, [id]
    );
    if (!rows[0]) return null;
    const [items] = await pool.query(
      `SELECT pi.*, pr.name AS product_name, pr.sku
       FROM purchase_items pi
       JOIN products pr ON pr.id = pi.product_id
       WHERE pi.purchase_id = ?`, [id]
    );
    return { ...rows[0], items };
  }

  static async create(data) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const purchaseNumber = generateRefNumber('PO');
      const totalAmount = data.items.reduce((sum, item) => sum + (item.quantity * item.unit_cost), 0);

      const [result] = await conn.query(
        `INSERT INTO purchases (workspace_id, purchase_number, supplier_id, total_amount, status, order_date, notes, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [data.workspace_id, purchaseNumber, data.supplier_id || null, totalAmount,
         data.status || 'draft', data.order_date || new Date(), data.notes || null, data.created_by]
      );

      for (const item of data.items) {
        const totalCost = item.quantity * item.unit_cost;
        await conn.query(
          'INSERT INTO purchase_items (purchase_id, product_id, quantity, unit_cost, total_cost) VALUES (?, ?, ?, ?, ?)',
          [result.insertId, item.product_id, item.quantity, item.unit_cost, totalCost]
        );
      }

      await conn.commit();
      return this.getById(result.insertId);
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  }

  static async updateStatus(id, status) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      await conn.query('UPDATE purchases SET status = ? WHERE id = ?', [status, id]);

      // If received, increment stock for each item
      if (status === 'received') {
        await conn.query('UPDATE purchases SET received_date = CURDATE() WHERE id = ?', [id]);
        const [items] = await conn.query('SELECT * FROM purchase_items WHERE purchase_id = ?', [id]);
        for (const item of items) {
          await conn.query(
            'UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?',
            [item.quantity, item.product_id]
          );
        }
      }

      await conn.commit();
      return this.getById(id);
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  }

  static async delete(id) {
    const [result] = await pool.query('DELETE FROM purchases WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = Purchase;
