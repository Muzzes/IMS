const express = require('express');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const auth = require('../middleware/auth');
const workspaceScope = require('../middleware/workspaceScope');
const auditLog = require('../middleware/auditLog');
const productController = require('../controllers/productController');

const router = express.Router();

router.use(auth);
const requireVerified = require('../middleware/requireVerified');
router.use(requireVerified);
router.use(workspaceScope);

router.get('/',           productController.getAll);
router.get('/categories', productController.getCategories);
router.get('/:id',        productController.getById);
const productValidation = [
  body('name').trim().notEmpty().withMessage('Product name is required').isLength({ max: 200 }).withMessage('Name too long'),
  body('sku').optional({ checkFalsy: true }).trim().isLength({ max: 50 }).matches(/^[a-zA-Z0-9-_]+$/).withMessage('SKU must be alphanumeric, hyphens, or underscores'),
  body('unit_price').optional().isFloat({ min: 0 }).withMessage('Unit price must be purely numeric and >= 0'),
  body('cost_price').optional().isFloat({ min: 0 }).withMessage('Cost price must be numeric and >= 0'),
  body('stock_quantity').optional().isInt({ min: 0 }).withMessage('Stock must be purely a non-negative integer'),
  body('min_stock_level').optional().isInt({ min: 0 })
];

router.post('/',          productValidation, validate, auditLog('CREATE_PRODUCT'), productController.create);
router.put('/:id',        productValidation, validate, auditLog('UPDATE_PRODUCT'), productController.update);
router.put('/:id/stock',  auditLog('ADJUST_PRODUCT_STOCK'), productController.adjustStock);
router.delete('/:id',     auditLog('DELETE_PRODUCT'), productController.delete);

module.exports = router;
