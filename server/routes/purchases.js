const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const workspaceScope = require('../middleware/workspaceScope');
const authorize = require('../middleware/authorize');
const auditLog = require('../middleware/auditLog');
const purchaseController = require('../controllers/purchaseController');

const router = express.Router();

router.use(auth);
const requireVerified = require('../middleware/requireVerified');
router.use(requireVerified);
router.use(authorize('admin', 'staff'));
router.use(workspaceScope);

router.get('/',              purchaseController.getAll);
router.get('/:id',           purchaseController.getById);

router.post('/', [
  body('items').isArray({ min: 1 }).withMessage('Items array is required with at least one item.'),
  body('items.*.product_id').isInt().withMessage('Valid product ID is required.'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1.'),
  body('items.*.unit_cost').isNumeric().withMessage('Unit cost must be a number.')
], validate, auditLog('CREATE_PURCHASE'), purchaseController.create);

router.put('/:id', [
  body('items').isArray({ min: 1 }).withMessage('Items array is required with at least one item.'),
  body('items.*.product_id').isInt().withMessage('Valid product ID is required.'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1.'),
  body('items.*.unit_cost').isNumeric().withMessage('Unit cost must be a number.')
], validate, auditLog('UPDATE_PURCHASE'), purchaseController.update);

router.put('/:id/status',   auditLog('UPDATE_PURCHASE_STATUS'), purchaseController.updateStatus);
router.delete('/:id',       auditLog('DELETE_PURCHASE'), purchaseController.delete);

module.exports = router;
