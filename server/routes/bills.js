const express = require('express');
const auth = require('../middleware/auth');
const workspaceScope = require('../middleware/workspaceScope');
const authorize = require('../middleware/authorize');
const billController = require('../controllers/billController');

const router = express.Router();

router.use(auth);
router.use(authorize('admin', 'staff'));
router.use(workspaceScope);

router.get('/',                billController.getAll);
router.get('/summary',         billController.getSummary);
router.get('/:id',             billController.getById);
router.post('/',               billController.create);
router.put('/:id',             billController.update);
router.post('/:id/payments',   billController.addPayment);
router.delete('/:id',          billController.delete);

module.exports = router;
