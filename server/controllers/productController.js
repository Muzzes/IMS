const Product = require('../models/Product');

const productController = {
  getAll: async (req, res) => {
    try {
      const result = await Product.getAll(req.workspaceId, req.query);
      res.json(result);
    } catch (error) {
      console.error('Get products error:', error);
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
      console.error('Get product error:', error);
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
      console.error('Create product error:', error);
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
      console.error('Update product error:', error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  },

  delete: async (req, res) => {
    try {
      const deleted = await Product.delete(req.params.id);
      if (!deleted) return res.status(404).json({ message: 'Product not found.' });
      res.json({ message: 'Product deleted.' });
    } catch (error) {
      console.error('Delete product error:', error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  },

  getCategories: async (req, res) => {
    try {
      const categories = await Product.getCategories(req.workspaceId);
      res.json({ categories });
    } catch (error) {
      console.error('Get categories error:', error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  }
};

module.exports = productController;
