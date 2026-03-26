const Bill = require('../models/Bill');

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
      const bill = await Bill.update(req.params.id, req.body);
      if (!bill) return res.status(404).json({ message: 'Bill not found.' });
      res.json({ message: 'Bill updated.', bill });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error.' });
    }
  },

  addPayment: async (req, res) => {
    try {
      const bill = await Bill.addPayment(req.params.id, req.body);
      res.status(201).json({ message: 'Payment recorded.', bill });
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
