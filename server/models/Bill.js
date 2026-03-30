const pool = require('../config/db');
const { getPagination, paginatedResponse, generateRefNumber } = require('../utils/helpers');

class Bill {
  static async getAll(workspaceId, query = {}) {
    const { page, limit, offset } = getPagination(query);
    let where = 'WHERE 1=1';
    const params = [];

    if (workspaceId) {
      where += ' AND b.workspace_id = ?';
      params.push(workspaceId);
    }
    if (query.status) {
      where += ' AND b.status = ?';
      params.push(query.status);
    }

    const [rows] = await pool.query(
      `SELECT b.*, s.name AS supplier_name, u.name AS created_by_name
       FROM bills b
       LEFT JOIN suppliers s ON s.id = b.supplier_id
       LEFT JOIN users u ON u.id = b.created_by
       ${where}
       ORDER BY b.created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM bills b ${where}`, params);
    return paginatedResponse(rows, total, page, limit);
  }

  static async getById(id) {
    const [rows] = await pool.query(
      `SELECT b.*, s.name AS supplier_name, u.name AS created_by_name
       FROM bills b
       LEFT JOIN suppliers s ON s.id = b.supplier_id
       LEFT JOIN users u ON u.id = b.created_by
       WHERE b.id = ?`, [id]
    );
    if (!rows[0]) return null;
    const [payments] = await pool.query(
      'SELECT id, bill_id, amount, payment_method, reference, payment_date, notes FROM bill_payments WHERE bill_id = ? ORDER BY payment_date DESC', [id]
    );
    return { ...rows[0], payments };
  }

  static async create(data) {
    const billNumber = generateRefNumber('BILL');
    const [result] = await pool.query(
      `INSERT INTO bills (workspace_id, bill_number, purchase_id, supplier_id, total_amount, status, due_date, notes, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [data.workspace_id, billNumber, data.purchase_id || null, data.supplier_id || null,
       data.total_amount, data.status || 'pending', data.due_date || null, data.notes || null, data.created_by]
    );
    return this.getById(result.insertId);
  }

  static async addPayment(billId, data) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      await conn.query(
        `INSERT INTO bill_payments (bill_id, amount, payment_method, reference, payment_date, notes)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [billId, data.amount, data.payment_method || null, data.reference || null,
         data.payment_date || new Date(), data.notes || null]
      );

      // Update paid amount and status
      const [[bill]] = await conn.query('SELECT total_amount FROM bills WHERE id = ?', [billId]);
      const [[{ paid }]] = await conn.query(
        'SELECT COALESCE(SUM(amount), 0) AS paid FROM bill_payments WHERE bill_id = ?', [billId]
      );

      let status = 'partially_paid';
      if (paid >= bill.total_amount) status = 'paid';

      await conn.query(
        'UPDATE bills SET paid_amount = ?, status = ? WHERE id = ?',
        [paid, status, billId]
      );

      await conn.commit();
      return this.getById(billId);
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  }

  static async update(id, data) {
    const allowed = ['status', 'due_date', 'notes', 'total_amount'];
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
    await pool.query(`UPDATE bills SET ${updates.join(', ')} WHERE id = ?`, values);
    return this.getById(id);
  }

  static async delete(id) {
    const [result] = await pool.query('DELETE FROM bills WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  static async getSummary(workspaceId) {
    let where = '';
    const params = [];
    if (workspaceId) {
      where = 'WHERE workspace_id = ?';
      params.push(workspaceId);
    }
    const [rows] = await pool.query(
      `SELECT status, COUNT(*) as count, COALESCE(SUM(total_amount),0) as total
       FROM bills ${where} GROUP BY status`, params
    );
    return rows;
  }
}

module.exports = Bill;
