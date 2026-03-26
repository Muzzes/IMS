const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
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

router.post('/', [
  body('items').isArray({ min: 1 }).withMessage('Items array is required with at least one item.'),
  body('items.*.product_id').isInt().withMessage('Valid product ID is required.'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1.'),
  body('items.*.unit_price').isNumeric().withMessage('Unit price must be a number.')
], validate, saleController.create);
router.delete('/:id', saleController.delete);

module.exports = router;
