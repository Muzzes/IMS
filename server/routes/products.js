const express = require('express');
const auth = require('../middleware/auth');
const workspaceScope = require('../middleware/workspaceScope');
const productController = require('../controllers/productController');

const router = express.Router();

router.use(auth);
router.use(workspaceScope);

router.get('/',           productController.getAll);
router.get('/categories', productController.getCategories);
router.get('/:id',        productController.getById);
router.post('/',          productController.create);
router.put('/:id',        productController.update);
router.delete('/:id',     productController.delete);

module.exports = router;
