const pool = require('../config/db');

const requireVerified = async (req, res, next) => {
  try {
    const [user] = await pool.query(
      `SELECT email_verified FROM users WHERE id = ?`,
      [req.user.id]
    );

    if (!user[0] || !user[0].email_verified) {
      return res.status(403).json({
        error: 'Email not verified',
        code: 'EMAIL_NOT_VERIFIED',
        message: 'Please verify your email address to access this feature.',
      });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: 'Internal server error while checking verification' });
  }
};

module.exports = requireVerified;
