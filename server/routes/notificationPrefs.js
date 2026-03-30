const express = require('express');
const auth = require('../middleware/auth');
const requireVerified = require('../middleware/requireVerified');
const notificationPrefController = require('../controllers/notificationPrefController');

const router = express.Router();

router.use(auth);
router.use(requireVerified);

router.get('/preferences', notificationPrefController.getPreferences);
router.put('/preferences', notificationPrefController.updatePreferences);

module.exports = router;
