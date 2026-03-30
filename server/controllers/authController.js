const User = require('../models/User');
const WorkspaceUser = require('../models/WorkspaceUser');
const jwt = require('jsonwebtoken');
const tokenBlacklist = require('../middleware/tokenBlacklist');
const bcrypt = require('bcrypt');
const pool = require('../config/db');
const generateVerifyToken = require('../utils/generateVerifyToken');
const { sendVerificationEmail, sendWelcomeEmail, sendPasswordResetEmail } = require('../templates/emails');

const isDisposable = require('disposable-email-domains');
const verifyEmailDomain = require('../utils/verifyEmailDomain');

const authController = {
  register: async (req, res) => {
    try {
      const { name, email, password, role, workspace_id } = req.body;
      
      const domain = email.split('@')[1];
      if (isDisposable.includes(domain)) {
        return res.status(422).json({ error: 'Disposable email addresses are not allowed', field: 'email' });
      }

      const mxCheck = await verifyEmailDomain(email);
      if (!mxCheck.valid) {
        return res.status(422).json({ error: 'This email domain cannot receive emails. Please use a valid email address.', field: 'email' });
      }

      const existing = await User.findByEmail(email);
      if (existing) {
        return res.status(409).json({ message: 'Email already registered.' });
      }

      const userRole = role || 'staff';
      const hash = await bcrypt.hash(password, 12);
      
      const [result] = await pool.query(
        `INSERT INTO users (name, email, password, role, is_active, created_at, email_verified) VALUES (?, ?, ?, ?, true, NOW(), FALSE)`,
        [name, email, hash, userRole]
      );
      
      const userId = result.insertId;

      if (workspace_id) {
        await WorkspaceUser.assign({
          workspace_id,
          user_id: userId,
          access_level: 'full',
          assigned_by: req.user ? req.user.id : null
        });
      }

      const token = generateVerifyToken();
      const expires = new Date(Date.now() + 24 * 3600 * 1000);

      await pool.query(
        `INSERT INTO email_verifications (user_id, token, email, type, expires_at, ip_address) VALUES (?, ?, ?, 'registration', ?, ?)`,
        [userId, token, email, expires, req.ip]
      );

      await pool.query(
        `INSERT INTO notification_preferences (user_id) VALUES (?)`,
        [userId]
      );

      await sendVerificationEmail(name, email, token);

      res.status(201).json({
        message: 'Registration successful. Please check your email to verify your account.',
        email: email,
        verified: false,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  },

  verifyEmail: async (req, res) => {
    try {
      const { token } = req.body;
      if (!token) return res.status(400).json({ error: 'Verification token required' });

      const [record] = await pool.query(
        `SELECT ev.*, u.name, u.email as user_email, u.role FROM email_verifications ev JOIN users u ON ev.user_id = u.id WHERE ev.token = ? AND ev.type = 'registration' AND ev.used_at IS NULL`,
        [token]
      );

      if (!record.length) {
        return res.status(400).json({ error: 'Invalid or already used verification link.' });
      }

      const verification = record[0];

      if (new Date(verification.expires_at) < new Date()) {
        return res.status(400).json({
          error: 'Verification link has expired.',
          code: 'TOKEN_EXPIRED',
          email: verification.email,
        });
      }

      await pool.query(`UPDATE email_verifications SET used_at = NOW() WHERE token = ?`, [token]);
      await pool.query(`UPDATE users SET email_verified = TRUE WHERE id = ?`, [verification.user_id]);

      await sendWelcomeEmail(verification.name, verification.user_email, verification.role);

      const payload = { id: verification.user_id, role: verification.role };
      const jwtToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1h' });
      const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' });

      res.json({ message: 'Email verified successfully!', token: jwtToken, refreshToken, user: { id: verification.user_id, name: verification.name, email: verification.user_email, role: verification.role } });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  },

  resendVerification: async (req, res) => {
    try {
      const { email } = req.body;
      const [user] = await pool.query(`SELECT * FROM users WHERE email = ? AND email_verified = FALSE`, [email]);

      if (!user.length) {
        return res.json({ message: 'If this email exists and is unverified, a new link has been sent.' });
      }

      const [recentSends] = await pool.query(
        `SELECT COUNT(*) as count FROM email_verifications WHERE user_id = ? AND type = 'registration' AND created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)`,
        [user[0].id]
      );

      if (recentSends[0].count >= 3) {
        return res.status(429).json({ error: 'Too many resend attempts. Please try again in 1 hour.' });
      }

      await pool.query(
        `UPDATE email_verifications SET used_at = NOW() WHERE user_id = ? AND type = 'registration' AND used_at IS NULL`,
        [user[0].id]
      );

      const token = generateVerifyToken();
      const expires = new Date(Date.now() + 24 * 3600 * 1000);

      await pool.query(
        `INSERT INTO email_verifications (user_id, token, email, type, expires_at) VALUES (?, ?, ?, 'registration', ?)`,
        [user[0].id, token, email, expires]
      );

      await sendVerificationEmail(user[0].name, email, token);

      res.json({ message: 'Verification email resent. Check your inbox.' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  },

  forgotPassword: async (req, res) => {
    try {
      const { email } = req.body;
      const [user] = await pool.query(`SELECT * FROM users WHERE email = ? AND is_active = TRUE`, [email]);

      if (!user.length) {
        return res.json({ message: 'If the email exists, a password reset link has been sent.' });
      }

      await pool.query(`UPDATE email_verifications SET used_at = NOW() WHERE user_id = ? AND type = 'password_reset' AND used_at IS NULL`, [user[0].id]);

      const token = generateVerifyToken();
      const expires = new Date(Date.now() + 1 * 3600 * 1000); // 1 hour

      await pool.query(
        `INSERT INTO email_verifications (user_id, token, email, type, expires_at) VALUES (?, ?, ?, 'password_reset', ?)`,
        [user[0].id, token, email, expires]
      );

      await sendPasswordResetEmail(user[0].name, email, token);
      res.json({ message: 'If the email exists, a password reset link has been sent.' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  },

  resetPassword: async (req, res) => {
    try {
      const { token, password } = req.body;
      const [record] = await pool.query(
        `SELECT * FROM email_verifications WHERE token = ? AND type = 'password_reset' AND used_at IS NULL`,
        [token]
      );

      if (!record.length || new Date(record[0].expires_at) < new Date()) {
        return res.status(400).json({ error: 'Invalid or expired password reset token.' });
      }

      const hash = await bcrypt.hash(password, 12);
      await pool.query(`UPDATE users SET password = ? WHERE id = ?`, [hash, record[0].user_id]);
      await pool.query(`UPDATE email_verifications SET used_at = NOW() WHERE token = ?`, [token]);

      res.json({ message: 'Password has been successfully reset.' });
    } catch (error) {
      console.error(error);
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
      
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials.' });
      }

      const payload = { id: user.id, role: user.role };
      const jwtToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1h' });
      const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' });

      res.json({
        message: 'Login successful.',
        user: { id: user.id, name: user.name, email: user.email, role: user.role, email_verified: user.email_verified },
        token: jwtToken,
        refreshToken
      });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error.' });
    }
  },

  refresh: async (req, res) => {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) return res.status(400).json({ message: 'Refresh token is required.' });
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      const user = await User.findById(decoded.id);
      if (!user) return res.status(401).json({ message: 'User not found.' });
      const payload = { id: user.id, role: user.role };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1h' });
      res.json({ token });
    } catch (error) {
      return res.status(401).json({ message: 'Invalid refresh token.' });
    }
  },

  logout: async (req, res) => {
    try {
      const { refreshToken } = req.body;
      const { token } = req;
      if (token && req.user && req.user.exp) {
        tokenBlacklist.add(token, req.user.exp);
      }
      if (refreshToken) {
        try {
          const decodedRefresh = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
          tokenBlacklist.add(refreshToken, decodedRefresh.exp);
        } catch {}
      }
      res.json({ message: 'Logged out successfully.' });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error.' });
    }
  },

  me: async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ message: 'User not found.' });
      res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role, email_verified: user.email_verified } });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error.' });
    }
  }
};

module.exports = authController;
