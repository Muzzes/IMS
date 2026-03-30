const express = require('express');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const emailLogController = require('../controllers/emailLogController');

const router = express.Router();

router.use(auth);
router.use(authorize('admin'));

router.get('/', emailLogController.getAll);

module.exports = router;
