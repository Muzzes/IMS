const Purchase = require('../models/Purchase');
const pool = require('../config/db');
const { sendPurchaseOrderUpdate } = require('../templates/emails');
const { shouldSendEmail } = require('../utils/notificationUtils');

const purchaseController = {
  getAll: async (req, res) => {
    try {
      const result = await Purchase.getAll(req.workspaceId, req.query);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error.' });
    }
  },

  getById: async (req, res) => {
    try {
      const purchase = await Purchase.getById(req.params.id);
      if (!purchase) return res.status(404).json({ message: 'Purchase not found.' });
      if (req.workspaceId && purchase.workspace_id !== req.workspaceId) {
        return res.status(403).json({ message: 'Forbidden.' });
      }
      res.json({ purchase });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error.' });
    }
  },

  create: async (req, res) => {
    try {
      const data = { ...req.body, workspace_id: req.workspaceId || req.body.workspace_id, created_by: req.user.id };
      const purchase = await Purchase.create(data);
      res.status(201).json({ message: 'Purchase order created.', purchase });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error.' });
    }
  },

  update: async (req, res) => {
    try {
      const data = { ...req.body };
      const purchase = await Purchase.update(req.params.id, data);
      res.status(200).json({ message: 'Purchase order updated.', purchase });
    } catch (error) {
      if (error.message === 'Purchase not found') {
        return res.status(404).json({ message: 'Purchase not found.' });
      }
      res.status(500).json({ message: 'Internal server error.' });
    }
  },

  updateStatus: async (req, res) => {
    try {
      const { status } = req.body;
      const purchase = await Purchase.updateStatus(req.params.id, status);
      if (!purchase) return res.status(404).json({ message: 'Purchase not found.' });

      // Send email notification on key status changes
      if (['received', 'cancelled', 'partial'].includes(status)) {
        try {
          // Get all staff/admin in this workspace to notify
          const [workspaceUsers] = await pool.query(
            `SELECT u.id, u.name, u.email FROM users u
             JOIN workspace_users wu ON wu.user_id = u.id
             WHERE wu.workspace_id = ? AND u.role IN ('admin', 'staff') AND u.email_verified = TRUE`,
            [purchase.workspace_id]
          );
          for (const user of workspaceUsers) {
            const canSend = await shouldSendEmail(user.id, 'purchase_update');
            if (canSend) {
              await sendPurchaseOrderUpdate(user.email, user.name, {
                id: purchase.id,
                number: purchase.purchase_number,
                supplier_name: purchase.supplier_name,
                total: parseFloat(purchase.total_amount),
                items: purchase.items || []
              }, status);
            }
          }
        } catch (emailErr) {
          // Don't fail the request if email fails
          console.error('Purchase notification email failed:', emailErr.message);
        }
      }

      res.json({ message: `Purchase status updated to ${status}.`, purchase });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error.' });
    }
  },

  delete: async (req, res) => {
    try {
      const deleted = await Purchase.delete(req.params.id);
      if (!deleted) return res.status(404).json({ message: 'Purchase not found.' });
      res.json({ message: 'Purchase deleted.' });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error.' });
    }
  }
};

module.exports = purchaseController;
