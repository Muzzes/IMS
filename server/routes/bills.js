const express = require('express');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const auth = require('../middleware/auth');
const workspaceScope = require('../middleware/workspaceScope');
const authorize = require('../middleware/authorize');
const auditLog = require('../middleware/auditLog');
const billController = require('../controllers/billController');

const router = express.Router();

router.use(auth);
const requireVerified = require('../middleware/requireVerified');
router.use(requireVerified);
router.use(authorize('admin', 'staff'));
router.use(workspaceScope);

router.get('/',                billController.getAll);
router.get('/summary',         billController.getSummary);
router.get('/:id',             billController.getById);
const billValidation = [
  body('total_amount').isFloat({ min: 0 }).withMessage('Total amount must be a number >= 0'),
  body('supplier_id').optional({ checkFalsy: true }).isInt()
];

const paymentValidation = [
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('payment_method').optional({ checkFalsy: true }).trim().isLength({ max: 50 }),
  body('reference').optional({ checkFalsy: true }).trim().isLength({ max: 100 })
];

router.post('/',               billValidation, validate, auditLog('CREATE_BILL'), billController.create);
router.put('/:id',             auditLog('UPDATE_BILL'), billController.update);
router.post('/:id/payments',   paymentValidation, validate, auditLog('ADD_BILL_PAYMENT'), billController.addPayment);
router.delete('/:id',          auditLog('DELETE_BILL'), billController.delete);

module.exports = router;
