const Bill = require('../models/Bill');
const pool = require('../config/db');
const { sendBillToCustomer, sendPaymentConfirmation } = require('../templates/emails');
const { shouldSendEmail } = require('../utils/notificationUtils');

const billController = {
  getAll: async (req, res) => {
    try {
      const result = await Bill.getAll(req.workspaceId, req.query);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error.' });
    }
  },

  getById: async (req, res) => {
    try {
      const bill = await Bill.getById(req.params.id);
      if (!bill) return res.status(404).json({ message: 'Bill not found.' });
      if (req.workspaceId && bill.workspace_id !== req.workspaceId) {
        return res.status(403).json({ message: 'Forbidden.' });
      }
      res.json({ bill });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error.' });
    }
  },

  create: async (req, res) => {
    try {
      const data = { ...req.body, workspace_id: req.workspaceId || req.body.workspace_id, created_by: req.user.id };
      const bill = await Bill.create(data);
      res.status(201).json({ message: 'Bill created.', bill });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error.' });
    }
  },

  update: async (req, res) => {
    try {
      const prevBill = await Bill.getById(req.params.id);
      const bill = await Bill.update(req.params.id, req.body);
      if (!bill) return res.status(404).json({ message: 'Bill not found.' });

      // Trigger customer email when bill status changes to 'issued'
      if (req.body.status === 'issued' && prevBill?.status !== 'issued' && req.body.customer_email) {
        try {
          const canSend = await shouldSendEmail(req.user.id, 'bill_issued');
          if (canSend) {
            await sendBillToCustomer(req.body.customer_email, req.body.customer_name || 'Customer', {
              ...bill,
              workspace_name: req.body.workspace_name
            });
          }
        } catch (emailErr) {
          console.error('Bill issued notification failed:', emailErr.message);
        }
      }

      res.json({ message: 'Bill updated.', bill });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error.' });
    }
  },

  addPayment: async (req, res) => {
    try {
      const bill = await Bill.addPayment(req.params.id, req.body);
      res.status(201).json({ message: 'Payment recorded.', bill });

      // Send payment confirmation to customer asynchronously
      if (req.body.customer_email) {
        try {
          const canSend = await shouldSendEmail(req.user.id, 'payment');
          if (canSend) {
            await sendPaymentConfirmation(
              req.body.customer_email,
              req.body.customer_name || 'Customer',
              bill,
              { amount: req.body.amount, method: req.body.payment_method || 'N/A', payment_date: req.body.payment_date || new Date(), reference: req.body.reference }
            );
          }
        } catch (emailErr) {
          console.error('Payment confirmation email failed:', emailErr.message);
        }
      }
    } catch (error) {
      res.status(500).json({ message: 'Internal server error.' });
    }
  },

  delete: async (req, res) => {
    try {
      const deleted = await Bill.delete(req.params.id);
      if (!deleted) return res.status(404).json({ message: 'Bill not found.' });
      res.json({ message: 'Bill deleted.' });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error.' });
    }
  },

  getSummary: async (req, res) => {
    try {
      const summary = await Bill.getSummary(req.workspaceId);
      res.json({ summary });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error.' });
    }
  }
};

module.exports = billController;
