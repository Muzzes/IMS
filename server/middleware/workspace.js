const requireWorkspaceAccess = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  // Admins bypass workspace checks
  if (req.user.role === 'admin') {
    return next();
  }

  const requestedWorkspaceId = req.headers['x-workspace-id'] || req.body.workspace_id || req.query.workspace_id;

  if (!requestedWorkspaceId) {
    return res.status(400).json({ message: 'Workspace context missing from request' });
  }

  // Ensure requested workspace is in the user's allowed list
  if (!req.user.workspaces || !req.user.workspaces.includes(parseInt(requestedWorkspaceId, 10))) {
    return res.status(403).json({ message: 'Isolated data access violation. Action blocked and logged.' });
  }

  req.workspace_id = parseInt(requestedWorkspaceId, 10);
  next();
};

module.exports = requireWorkspaceAccess;
