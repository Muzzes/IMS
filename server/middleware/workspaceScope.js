const pool = require('../config/db');

/**
 * Workspace scoping middleware.
 * - Reads workspace_id from query, body, or params
 * - Admin: bypasses check, can access any workspace
 * - Others: validates user is assigned to that workspace
 * - Attaches req.workspaceId for downstream use
 */
const workspaceScope = async (req, res, next) => {
  try {
    const workspaceId = req.query.workspace_id || req.body.workspace_id || req.params.workspaceId;

    if (!workspaceId) {
      // Admin without workspace_id means global access
      if (req.user.role === 'admin') {
        req.workspaceId = null; // null = all workspaces
        return next();
      }
      return res.status(400).json({ message: 'workspace_id is required.' });
    }

    const wsId = parseInt(workspaceId);
    if (isNaN(wsId)) {
      return res.status(400).json({ message: 'Invalid workspace_id.' });
    }

    // Admin can access any workspace
    if (req.user.role === 'admin') {
      req.workspaceId = wsId;
      return next();
    }

    // Check if user is assigned to this workspace
    const [rows] = await pool.query(
      'SELECT workspace_id, access_level FROM workspace_users WHERE user_id = ?',
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(403).json({ message: 'Forbidden. You do not have access to any workspace.' });
    }

    // Forcefully scope non-admins to their assigned workspace to prevent tampering
    req.workspaceId = rows[0].workspace_id;
    req.workspaceAccess = rows[0].access_level;
    next();
  } catch (error) {
    console.error('Workspace scope error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

module.exports = workspaceScope;
