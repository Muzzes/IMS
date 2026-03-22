const Purchase = require('../models/Purchase');

const purchaseController = {
  getAll: async (req, res) => {
    try {
      const result = await Purchase.getAll(req.workspaceId, req.query);
      res.json(result);
    } catch (error) {
      console.error('Get purchases error:', error);
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
      console.error('Get purchase error:', error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  },

  create: async (req, res) => {
    try {
      const data = { ...req.body, workspace_id: req.workspaceId || req.body.workspace_id, created_by: req.user.id };
      const purchase = await Purchase.create(data);
      res.status(201).json({ message: 'Purchase order created.', purchase });
    } catch (error) {
      console.error('Create purchase error:', error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  },

  updateStatus: async (req, res) => {
    try {
      const { status } = req.body;
      const purchase = await Purchase.updateStatus(req.params.id, status);
      if (!purchase) return res.status(404).json({ message: 'Purchase not found.' });
      res.json({ message: `Purchase status updated to ${status}.`, purchase });
    } catch (error) {
      console.error('Update purchase status error:', error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  },

  delete: async (req, res) => {
    try {
      const deleted = await Purchase.delete(req.params.id);
      if (!deleted) return res.status(404).json({ message: 'Purchase not found.' });
      res.json({ message: 'Purchase deleted.' });
    } catch (error) {
      console.error('Delete purchase error:', error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  }
};

module.exports = purchaseController;
