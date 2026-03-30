const express = require('express');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const auditLog = require('../middleware/auditLog');
const workspaceController = require('../controllers/workspaceController');

const router = express.Router();

router.use(auth);
const requireVerified = require('../middleware/requireVerified');
router.use(requireVerified);

// User's own workspaces (all authenticated users)
router.get('/my-workspaces', workspaceController.getMyWorkspaces);

// Admin-only workspace management
router.get('/',                          authorize('admin'), workspaceController.getAll);
router.post('/',                         authorize('admin'), auditLog('CREATE_WORKSPACE'), workspaceController.create);
router.get('/:id',                       authorize('admin'), workspaceController.getById);
router.put('/:id',                       authorize('admin'), auditLog('UPDATE_WORKSPACE'), workspaceController.update);
router.delete('/:id',                    authorize('admin'), auditLog('DELETE_WORKSPACE'), workspaceController.delete);

// User assignment management
router.get('/:id/users',                 authorize('admin'), workspaceController.getUsers);
router.post('/:id/users',               authorize('admin'), auditLog('ASSIGN_WORKSPACE_USER'), workspaceController.assignUser);
router.put('/:id/users/:userId',         authorize('admin'), auditLog('UPDATE_WORKSPACE_USER'), workspaceController.updateUserAccess);
router.delete('/:id/users/:userId',      authorize('admin'), auditLog('REVOKE_WORKSPACE_USER'), workspaceController.revokeUser);

module.exports = router;
