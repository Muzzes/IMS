const User = require('../models/User');

const userController = {
  getAll: async (req, res) => {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 20;
      const result = await User.getAll({ page, limit });
      res.json(result);
    } catch (error) {
      console.error('User getAll error:', error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  },

  getById: async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) return res.status(404).json({ message: 'User not found.' });
      res.json({ user });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error.' });
    }
  },

  update: async (req, res) => {
    try {
      const user = await User.update(req.params.id, req.body);
      if (!user) return res.status(404).json({ message: 'User not found.' });
      res.json({ message: 'User updated.', user });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error.' });
    }
  },

  delete: async (req, res) => {
    try {
      const deleted = await User.delete(req.params.id);
      if (!deleted) return res.status(404).json({ message: 'User not found.' });
      res.json({ message: 'User deleted.' });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error.' });
    }
  }
};

module.exports = userController;
