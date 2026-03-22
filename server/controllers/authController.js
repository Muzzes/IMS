const User = require('../models/User');
const jwt = require('jsonwebtoken');

const authController = {
  register: async (req, res) => {
    try {
      const { name, email, password, role } = req.body;
      const existing = await User.findByEmail(email);
      if (existing) {
        return res.status(409).json({ message: 'Email already registered.' });
      }

      const userRole = (req.user && req.user.role === 'admin') ? (role || 'staff') : 'staff';
      const user = await User.create({ name, email, password, role: userRole });
      res.status(201).json({ message: 'User registered successfully.', user });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials.' });
      }
      if (!user.is_active) {
        return res.status(403).json({ message: 'Account is deactivated.' });
      }
      const isMatch = await User.comparePassword(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials.' });
      }

      const payload = { id: user.id, email: user.email, role: user.role, name: user.name };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1h' });
      const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' });

      res.json({
        message: 'Login successful.',
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
        token,
        refreshToken
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  },

  refresh: async (req, res) => {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return res.status(400).json({ message: 'Refresh token is required.' });
      }
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(401).json({ message: 'User not found.' });
      }
      const payload = { id: user.id, email: user.email, role: user.role, name: user.name };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1h' });
      res.json({ token });
    } catch (error) {
      return res.status(401).json({ message: 'Invalid refresh token.' });
    }
  },

  me: async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }
      res.json({ user });
    } catch (error) {
      console.error('Me error:', error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  }
};

module.exports = authController;
