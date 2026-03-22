const Supplier = require('../models/Supplier');

const supplierController = {
  getAll: async (req, res) => {
    try {
      const result = await Supplier.getAll(req.workspaceId, req.query);
      res.json(result);
    } catch (error) {
      console.error('Get suppliers error:', error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  },

  getById: async (req, res) => {
    try {
      const supplier = await Supplier.getById(req.params.id);
      if (!supplier) return res.status(404).json({ message: 'Supplier not found.' });
      if (req.workspaceId && supplier.workspace_id !== req.workspaceId) {
        return res.status(403).json({ message: 'Forbidden.' });
      }
      res.json({ supplier });
    } catch (error) {
      console.error('Get supplier error:', error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  },

  create: async (req, res) => {
    try {
      const data = { ...req.body, workspace_id: req.workspaceId || req.body.workspace_id };
      const supplier = await Supplier.create(data);
      res.status(201).json({ message: 'Supplier created.', supplier });
    } catch (error) {
      console.error('Create supplier error:', error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  },

  update: async (req, res) => {
    try {
      const supplier = await Supplier.update(req.params.id, req.body);
      if (!supplier) return res.status(404).json({ message: 'Supplier not found.' });
      res.json({ message: 'Supplier updated.', supplier });
    } catch (error) {
      console.error('Update supplier error:', error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  },

  delete: async (req, res) => {
    try {
      const deleted = await Supplier.delete(req.params.id);
      if (!deleted) return res.status(404).json({ message: 'Supplier not found.' });
      res.json({ message: 'Supplier deleted.' });
    } catch (error) {
      console.error('Delete supplier error:', error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  }
};

module.exports = supplierController;
