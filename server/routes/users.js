const express = require('express');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const userController = require('../controllers/userController');

const router = express.Router();

router.use(auth);
router.use(authorize('admin'));

router.get('/',         userController.getAll);
router.get('/:id',      userController.getById);
router.put('/:id',      userController.update);
router.delete('/:id',   userController.delete);

module.exports = router;
