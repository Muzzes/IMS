const express = require('express');
const auth = require('../middleware/auth');
const workspaceScope = require('../middleware/workspaceScope');
const authorize = require('../middleware/authorize');
const reportController = require('../controllers/reportController');

const router = express.Router();

router.use(auth);
router.use(workspaceScope);

router.get('/dashboard',            reportController.getDashboardStats);
router.get('/sales-chart',          reportController.getSalesChart);
router.get('/top-products',         reportController.getTopProducts);
router.get('/workspace-comparison', authorize('admin'), reportController.getWorkspaceComparison);

module.exports = router;
