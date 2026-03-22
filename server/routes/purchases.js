const express = require('express');
const auth = require('../middleware/auth');
const workspaceScope = require('../middleware/workspaceScope');
const authorize = require('../middleware/authorize');
const purchaseController = require('../controllers/purchaseController');

const router = express.Router();

router.use(auth);
router.use(authorize('admin', 'staff'));
router.use(workspaceScope);

router.get('/',              purchaseController.getAll);
router.get('/:id',           purchaseController.getById);
router.post('/',             purchaseController.create);
router.put('/:id/status',   purchaseController.updateStatus);
router.delete('/:id',        purchaseController.delete);

module.exports = router;
