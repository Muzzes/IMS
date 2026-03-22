const express = require('express');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const workspaceController = require('../controllers/workspaceController');

const router = express.Router();

router.use(auth);

// User's own workspaces (all authenticated users)
router.get('/my-workspaces', workspaceController.getMyWorkspaces);

// Admin-only workspace management
router.get('/',                          authorize('admin'), workspaceController.getAll);
router.post('/',                         authorize('admin'), workspaceController.create);
router.get('/:id',                       authorize('admin'), workspaceController.getById);
router.put('/:id',                       authorize('admin'), workspaceController.update);
router.delete('/:id',                    authorize('admin'), workspaceController.delete);

// User assignment management
router.get('/:id/users',                 authorize('admin'), workspaceController.getUsers);
router.post('/:id/users',               authorize('admin'), workspaceController.assignUser);
router.put('/:id/users/:userId',         authorize('admin'), workspaceController.updateUserAccess);
router.delete('/:id/users/:userId',      authorize('admin'), workspaceController.revokeUser);

module.exports = router;
