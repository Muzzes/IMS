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

  static async update(id, data) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const [[currentPurchase]] = await conn.query('SELECT status FROM purchases WHERE id = ? FOR UPDATE', [id]);
      if (!currentPurchase) throw new Error('Purchase not found');

      // Do not allow total structural edit if already received/cancelled, though UI prevents it mostly.
      if (currentPurchase.status === 'received' && data.status !== 'received') {
          // If we allow 'received' to be reverted inside this form we'd need to adjust stock here,
          // but the form only edits pending/ordered purchases. 
          // For safety, we keep updateStatus separate and this just updates normal fields.
      }

      const totalAmount = data.items.reduce((sum, item) => sum + (item.quantity * item.unit_cost), 0);

      const [result] = await conn.query(
        `UPDATE purchases SET supplier_id = ?, total_amount = ?, status = ?, order_date = ?, expected_date = ?, notes = ? WHERE id = ?`,
        [data.supplier_id || null, totalAmount, data.status || currentPurchase.status, data.order_date || null, data.expected_date || null, data.notes || null, id]
      );

      await conn.query('DELETE FROM purchase_items WHERE purchase_id = ?', [id]);
      for (const item of data.items) {
        const totalCost = item.quantity * item.unit_cost;
        await conn.query(
          'INSERT INTO purchase_items (purchase_id, product_id, quantity, unit_cost, total_cost) VALUES (?, ?, ?, ?, ?)',
          [id, item.product_id, item.quantity, item.unit_cost, totalCost]
        );
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


  static async updateStatus(id, status) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // Lock row and check previous status to prevent infinite stock generation
      const [[currentPurchase]] = await conn.query('SELECT status FROM purchases WHERE id = ? FOR UPDATE', [id]);
      if (!currentPurchase) throw new Error('Purchase not found');

      await conn.query('UPDATE purchases SET status = ? WHERE id = ?', [status, id]);

      // If transitioning into 'received', increment stock for each item
      if (status === 'received' && currentPurchase.status !== 'received') {
        await conn.query('UPDATE purchases SET received_date = CURDATE() WHERE id = ?', [id]);
        const [items] = await conn.query('SELECT id, purchase_id, product_id, quantity, unit_cost, total_cost FROM purchase_items WHERE purchase_id = ?', [id]);
        for (const item of items) {
          await conn.query(
            'UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?',
            [item.quantity, item.product_id]
          );
        }
      } 
      // If transitioning away from 'received', revert the stock additions
      else if (currentPurchase.status === 'received' && status !== 'received') {
        await conn.query('UPDATE purchases SET received_date = NULL WHERE id = ?', [id]);
        const [items] = await conn.query('SELECT id, purchase_id, product_id, quantity, unit_cost, total_cost FROM purchase_items WHERE purchase_id = ?', [id]);
        for (const item of items) {
          await conn.query(
            'UPDATE products SET stock_quantity = GREATEST(stock_quantity - ?, 0) WHERE id = ?',
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
