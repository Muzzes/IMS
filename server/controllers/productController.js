const Product = require('../models/Product');

const productController = {
  getAll: async (req, res) => {
    try {
      const result = await Product.getAll(req.workspaceId, req.query);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error.' });
    }
  },

  getById: async (req, res) => {
    try {
      const product = await Product.getById(req.params.id);
      if (!product) return res.status(404).json({ message: 'Product not found.' });
      // Check workspace access for non-admin
      if (req.workspaceId && product.workspace_id !== req.workspaceId) {
        return res.status(403).json({ message: 'Forbidden.' });
      }
      res.json({ product });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error.' });
    }
  },

  create: async (req, res) => {
    try {
      const data = { ...req.body, workspace_id: req.workspaceId || req.body.workspace_id };
      // Manufacturer can only set themselves as manufacturer
      if (req.user.role === 'manufacturer') {
        data.manufacturer_id = req.user.id;
      }
      const product = await Product.create(data);
      res.status(201).json({ message: 'Product created.', product });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error.' });
    }
  },

  update: async (req, res) => {
    try {
      const existing = await Product.getById(req.params.id);
      if (!existing) return res.status(404).json({ message: 'Product not found.' });
      // Manufacturer can only edit own products
      if (req.user.role === 'manufacturer' && existing.manufacturer_id !== req.user.id) {
        return res.status(403).json({ message: 'You can only edit your own products.' });
      }
      const product = await Product.update(req.params.id, req.body);
      res.json({ message: 'Product updated.', product });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error.' });
    }
  },

  delete: async (req, res) => {
    try {
      const deleted = await Product.delete(req.params.id);
      if (!deleted) return res.status(404).json({ message: 'Product not found.' });
      res.json({ message: 'Product deleted.' });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error.' });
    }
  },

  getCategories: async (req, res) => {
    try {
      const categories = await Product.getCategories(req.workspaceId);
      res.json({ categories });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error.' });
    }
  },

  adjustStock: async (req, res) => {
    try {
      const { quantityChange } = req.body;
      if (typeof quantityChange !== 'number') return res.status(400).json({ message: 'Invalid quantity change.' });
      
      const product = await Product.getById(req.params.id);
      if (!product) return res.status(404).json({ message: 'Product not found.' });
      if (req.workspaceId && product.workspace_id !== req.workspaceId) {
        return res.status(403).json({ message: 'Forbidden.' });
      }
      
      const updated = await Product.adjustStock(req.params.id, quantityChange);
      res.json({ message: 'Stock adjusted.', product: updated });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error.' });
    }
  }
};

module.exports = productController;
