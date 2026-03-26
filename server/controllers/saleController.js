const Sale = require('../models/Sale');

const saleController = {
  getAll: async (req, res) => {
    try {
      const result = await Sale.getAll(req.workspaceId, req.query);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error.' });
    }
  },

  getById: async (req, res) => {
    try {
      const sale = await Sale.getById(req.params.id);
      if (!sale) return res.status(404).json({ message: 'Sale not found.' });
      if (req.workspaceId && sale.workspace_id !== req.workspaceId) {
        return res.status(403).json({ message: 'Forbidden.' });
      }
      res.json({ sale });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error.' });
    }
  },

  create: async (req, res) => {
    try {
      const data = { ...req.body, workspace_id: req.workspaceId || req.body.workspace_id, created_by: req.user.id };
      const sale = await Sale.create(data);
      res.status(201).json({ message: 'Sale recorded.', sale });
    } catch (error) {
      if (error.message.includes('Insufficient stock')) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: 'Internal server error.' });
    }
  },

  delete: async (req, res) => {
    try {
      const deleted = await Sale.delete(req.params.id);
      if (!deleted) return res.status(404).json({ message: 'Sale not found.' });
      res.json({ message: 'Sale deleted.' });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error.' });
    }
  }
};

module.exports = saleController;
