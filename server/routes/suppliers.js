const express = require('express');
const auth = require('../middleware/auth');
const workspaceScope = require('../middleware/workspaceScope');
const authorize = require('../middleware/authorize');
const supplierController = require('../controllers/supplierController');

const router = express.Router();

router.use(auth);
router.use(authorize('admin', 'staff'));
router.use(workspaceScope);

router.get('/',       supplierController.getAll);
router.get('/:id',    supplierController.getById);
router.post('/',      supplierController.create);
router.put('/:id',    supplierController.update);
router.delete('/:id', supplierController.delete);

module.exports = router;
