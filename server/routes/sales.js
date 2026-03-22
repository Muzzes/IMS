const express = require('express');
const auth = require('../middleware/auth');
const workspaceScope = require('../middleware/workspaceScope');
const authorize = require('../middleware/authorize');
const saleController = require('../controllers/saleController');

const router = express.Router();

router.use(auth);
router.use(authorize('admin', 'staff'));
router.use(workspaceScope);

router.get('/',       saleController.getAll);
router.get('/:id',    saleController.getById);
router.post('/',      saleController.create);
router.delete('/:id', saleController.delete);

module.exports = router;
