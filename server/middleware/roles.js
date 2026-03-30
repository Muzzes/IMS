const requireRole = (...roles) => (req, res, next) => {
  // Role is from decoded JWT, attached by auth middleware
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      message: 'Insufficient permissions',
      required: roles,
      current: req.user.role,
    });
  }
  next();
};

module.exports = requireRole;
