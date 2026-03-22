const pool = require('../config/db');

const reportController = {
  getDashboardStats: async (req, res) => {
    try {
      const wsFilter = req.workspaceId ? 'WHERE workspace_id = ?' : '';
      const wsParams = req.workspaceId ? [req.workspaceId] : [];

      const [[{ totalProducts }]] = await pool.query(
        `SELECT COUNT(*) as totalProducts FROM products ${wsFilter}`, wsParams
      );
      const [[{ totalSuppliers }]] = await pool.query(
        `SELECT COUNT(*) as totalSuppliers FROM suppliers ${wsFilter}`, wsParams
      );
      const [[{ totalSales, salesRevenue }]] = await pool.query(
        `SELECT COUNT(*) as totalSales, COALESCE(SUM(net_amount),0) as salesRevenue FROM sales ${wsFilter}`, wsParams
      );
      const [[{ totalPurchases, purchasesCost }]] = await pool.query(
        `SELECT COUNT(*) as totalPurchases, COALESCE(SUM(total_amount),0) as purchasesCost FROM purchases ${wsFilter}`, wsParams
      );
      const [[{ lowStockCount }]] = await pool.query(
        `SELECT COUNT(*) as lowStockCount FROM products ${wsFilter ? wsFilter + ' AND' : 'WHERE'} stock_quantity <= min_stock_level`, wsParams
      );
      const [[{ pendingBills }]] = await pool.query(
        `SELECT COALESCE(SUM(total_amount - paid_amount),0) as pendingBills FROM bills ${wsFilter ? wsFilter + ' AND' : 'WHERE'} status NOT IN ('paid','cancelled')`, wsParams
      );

      res.json({
        stats: {
          totalProducts, totalSuppliers, totalSales, salesRevenue: parseFloat(salesRevenue),
          totalPurchases, purchasesCost: parseFloat(purchasesCost), lowStockCount,
          pendingBills: parseFloat(pendingBills)
        }
      });
    } catch (error) {
      console.error('Dashboard stats error:', error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  },

  getSalesChart: async (req, res) => {
    try {
      const wsFilter = req.workspaceId ? 'WHERE workspace_id = ?' : '';
      const wsParams = req.workspaceId ? [req.workspaceId] : [];

      const [rows] = await pool.query(
        `SELECT DATE_FORMAT(created_at, '%Y-%m') as month,
                COUNT(*) as count,
                COALESCE(SUM(net_amount),0) as revenue
         FROM sales ${wsFilter}
         GROUP BY month ORDER BY month DESC LIMIT 12`, wsParams
      );
      res.json({ chartData: rows.reverse() });
    } catch (error) {
      console.error('Sales chart error:', error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  },

  getTopProducts: async (req, res) => {
    try {
      let wsFilter = '';
      const params = [];
      if (req.workspaceId) {
        wsFilter = 'JOIN products p ON p.id = si.product_id AND p.workspace_id = ?';
        params.push(req.workspaceId);
      } else {
        wsFilter = 'JOIN products p ON p.id = si.product_id';
      }

      const [rows] = await pool.query(
        `SELECT p.name, SUM(si.quantity) as total_sold, SUM(si.total_price) as total_revenue
         FROM sale_items si ${wsFilter}
         GROUP BY si.product_id, p.name
         ORDER BY total_sold DESC LIMIT 10`, params
      );
      res.json({ products: rows });
    } catch (error) {
      console.error('Top products error:', error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  },

  getWorkspaceComparison: async (req, res) => {
    try {
      // Admin-only: compare stats across workspaces
      const [rows] = await pool.query(
        `SELECT w.id, w.name, w.color,
                (SELECT COUNT(*) FROM products WHERE workspace_id = w.id) as products,
                (SELECT COALESCE(SUM(net_amount),0) FROM sales WHERE workspace_id = w.id) as revenue,
                (SELECT COUNT(*) FROM sales WHERE workspace_id = w.id) as sales_count,
                (SELECT COALESCE(SUM(total_amount),0) FROM purchases WHERE workspace_id = w.id) as purchases_total
         FROM workspaces w WHERE w.is_archived = FALSE`
      );
      res.json({ comparison: rows });
    } catch (error) {
      console.error('Workspace comparison error:', error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  }
};

module.exports = reportController;
