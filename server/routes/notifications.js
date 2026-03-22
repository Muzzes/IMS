const express = require('express');
const auth = require('../middleware/auth');
const workspaceScope = require('../middleware/workspaceScope');
const notificationController = require('../controllers/notificationController');

const router = express.Router();

router.use(auth);
router.use(workspaceScope);

router.get('/',              notificationController.getAll);
router.put('/:id/read',     notificationController.markRead);
router.put('/read-all',     notificationController.markAllRead);

module.exports = router;
