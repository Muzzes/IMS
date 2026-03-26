const pool = require('../config/db');
const { getPagination, paginatedResponse, generateRefNumber } = require('../utils/helpers');

class Sale {
  static async getAll(workspaceId, query = {}) {
    const { page, limit, offset } = getPagination(query);
    let where = 'WHERE 1=1';
    const params = [];

    if (workspaceId) {
      where += ' AND s.workspace_id = ?';
      params.push(workspaceId);
    }
    if (query.status) {
      where += ' AND s.status = ?';
      params.push(query.status);
    }
    if (query.search) {
      where += ' AND (s.customer_name LIKE ? OR s.sale_number LIKE ?)';
      params.push(`%${query.search}%`, `%${query.search}%`);
    }

    const [rows] = await pool.query(
      `SELECT s.*, u.name AS created_by_name
       FROM sales s
       LEFT JOIN users u ON u.id = s.created_by
       ${where}
       ORDER BY s.created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM sales s ${where}`, params);
    return paginatedResponse(rows, total, page, limit);
  }

  static async getById(id) {
    const [rows] = await pool.query(
      `SELECT s.*, u.name AS created_by_name
       FROM sales s LEFT JOIN users u ON u.id = s.created_by WHERE s.id = ?`, [id]
    );
    if (!rows[0]) return null;
    const [items] = await pool.query(
      `SELECT si.*, p.name AS product_name, p.sku
       FROM sale_items si JOIN products p ON p.id = si.product_id WHERE si.sale_id = ?`, [id]
    );
    return { ...rows[0], items };
  }

  static async create(data) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      let calculatedTotal = 0;
      const verifiedItems = [];

      // Check stock availability with row lock FOR UPDATE
      for (const item of data.items) {
        const [product] = await conn.query('SELECT stock_quantity, name, unit_price FROM products WHERE id = ? FOR UPDATE', [item.product_id]);
        if (!product[0]) throw new Error(`Product ${item.product_id} not found.`);
        if (product[0].stock_quantity < item.quantity) {
          throw new Error(`Insufficient stock for ${product[0].name}. Available: ${product[0].stock_quantity}`);
        }
        
        const realPrice = parseFloat(product[0].unit_price);
        calculatedTotal += item.quantity * realPrice;
        verifiedItems.push({ ...item, realPrice });
      }

      const saleNumber = generateRefNumber('INV');
      const discount = parseFloat(data.discount || 0);
      const tax = parseFloat(data.tax || 0);
      const netAmount = calculatedTotal - discount + tax;

      const [result] = await conn.query(
        `INSERT INTO sales (workspace_id, sale_number, customer_name, customer_email, customer_phone,
         total_amount, discount, tax, net_amount, status, notes, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [data.workspace_id, saleNumber, data.customer_name || null, data.customer_email || null,
         data.customer_phone || null, calculatedTotal, discount, tax, netAmount,
         data.status || 'completed', data.notes || null, data.created_by]
      );

      for (const item of verifiedItems) {
        const totalPrice = item.quantity * item.realPrice;
        await conn.query(
          'INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, total_price) VALUES (?, ?, ?, ?, ?)',
          [result.insertId, item.product_id, item.quantity, item.realPrice, totalPrice]
        );
        // Decrement stock
        await conn.query(
          'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?',
          [item.quantity, item.product_id]
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

  static async delete(id) {
    const [result] = await pool.query('DELETE FROM sales WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = Sale;
