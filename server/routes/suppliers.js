const express = require('express');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const auth = require('../middleware/auth');
const workspaceScope = require('../middleware/workspaceScope');
const authorize = require('../middleware/authorize');
const auditLog = require('../middleware/auditLog');
const supplierController = require('../controllers/supplierController');

const router = express.Router();

router.use(auth);
const requireVerified = require('../middleware/requireVerified');
router.use(requireVerified);
router.use(authorize('admin', 'staff'));
router.use(workspaceScope);

router.get('/',       supplierController.getAll);
router.get('/:id',    supplierController.getById);
const supplierValidation = [
  body('name').trim().notEmpty().withMessage('Supplier name is required').isLength({ max: 100 }),
  body('email').optional({ checkFalsy: true }).trim().isEmail().withMessage('Invalid email format').isLength({ max: 254 }),
  body('phone').optional({ checkFalsy: true }).trim().isLength({ max: 20 }),
  body('address').optional({ checkFalsy: true }).trim().isLength({ max: 500 })
];

router.post('/',      supplierValidation, validate, auditLog('CREATE_SUPPLIER'), supplierController.create);
router.put('/:id',    supplierValidation, validate, auditLog('UPDATE_SUPPLIER'), supplierController.update);
router.delete('/:id', auditLog('DELETE_SUPPLIER'), supplierController.delete);

module.exports = router;
