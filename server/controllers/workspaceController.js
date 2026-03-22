const Workspace = require('../models/Workspace');
const WorkspaceUser = require('../models/WorkspaceUser');

const workspaceController = {
  getAll: async (req, res) => {
    try {
      const workspaces = await Workspace.getAll();
      res.json({ workspaces });
    } catch (error) {
      console.error('Get workspaces error:', error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  },

  getById: async (req, res) => {
    try {
      const workspace = await Workspace.getById(req.params.id);
      if (!workspace) return res.status(404).json({ message: 'Workspace not found.' });
      res.json({ workspace });
    } catch (error) {
      console.error('Get workspace error:', error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  },

  create: async (req, res) => {
    try {
      const workspace = await Workspace.create(req.body);
      res.status(201).json({ message: 'Workspace created.', workspace });
    } catch (error) {
      console.error('Create workspace error:', error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  },

  update: async (req, res) => {
    try {
      const workspace = await Workspace.update(req.params.id, req.body);
      if (!workspace) return res.status(404).json({ message: 'Workspace not found.' });
      res.json({ message: 'Workspace updated.', workspace });
    } catch (error) {
      console.error('Update workspace error:', error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  },

  delete: async (req, res) => {
    try {
      const deleted = await Workspace.delete(req.params.id);
      if (!deleted) return res.status(404).json({ message: 'Workspace not found.' });
      res.json({ message: 'Workspace deleted.' });
    } catch (error) {
      console.error('Delete workspace error:', error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  },

  // User assignments
  getUsers: async (req, res) => {
    try {
      const users = await WorkspaceUser.getAllUsersWithWorkspaceAccess(req.params.id);
      res.json({ users });
    } catch (error) {
      console.error('Get workspace users error:', error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  },

  assignUser: async (req, res) => {
    try {
      const { user_id, access_level } = req.body;
      const assignment = await WorkspaceUser.assign({
        workspace_id: req.params.id,
        user_id,
        access_level: access_level || 'full',
        assigned_by: req.user.id
      });
      res.status(201).json({ message: 'User assigned.', assignment });
    } catch (error) {
      console.error('Assign user error:', error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  },

  revokeUser: async (req, res) => {
    try {
      const revoked = await WorkspaceUser.revoke(req.params.id, req.params.userId);
      if (!revoked) return res.status(404).json({ message: 'Assignment not found.' });
      res.json({ message: 'User access revoked.' });
    } catch (error) {
      console.error('Revoke user error:', error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  },

  updateUserAccess: async (req, res) => {
    try {
      const { access_level } = req.body;
      const result = await WorkspaceUser.updateAccessLevel(req.params.id, req.params.userId, access_level);
      if (!result) return res.status(404).json({ message: 'Assignment not found.' });
      res.json({ message: 'Access level updated.', assignment: result });
    } catch (error) {
      console.error('Update access error:', error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  },

  // User's own workspaces
  getMyWorkspaces: async (req, res) => {
    try {
      if (req.user.role === 'admin') {
        const workspaces = await Workspace.getAll();
        return res.json({ workspaces });
      }
      const assignments = await WorkspaceUser.getByUser(req.user.id);
      const workspaces = assignments.map(a => ({
        id: a.workspace_id,
        name: a.workspace_name,
        description: a.description,
        logo_url: a.logo_url,
        color: a.color,
        access_level: a.access_level
      }));
      res.json({ workspaces });
    } catch (error) {
      console.error('Get my workspaces error:', error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  }
};

module.exports = workspaceController;
