const express = require('express');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const auditLog = require('../middleware/auditLog');
const userController = require('../controllers/userController');

const router = express.Router();

router.use(auth);
const requireVerified = require('../middleware/requireVerified');
router.use(requireVerified);
router.use(authorize('admin'));

router.get('/',         userController.getAll);
router.get('/:id',      userController.getById);
router.put('/:id',      auditLog('UPDATE_USER'), userController.update);
router.delete('/:id',   auditLog('DELETE_USER'), userController.delete);

module.exports = router;
