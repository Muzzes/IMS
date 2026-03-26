const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

const router = express.Router();

router.post('/register', [
  auth,
  authorize('admin'),
  body('name').trim().notEmpty().withMessage('Name is required.'),
  body('email').isEmail().withMessage('Valid email is required.'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters.'),
  body('role').isIn(['staff', 'manufacturer', 'admin']).withMessage('Invalid role.'),
  body('workspace_id').notEmpty().withMessage('Company assignment is required.')
], validate, authController.register);

router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required.'),
  body('password').notEmpty().withMessage('Password is required.')
], validate, authController.login);

router.post('/refresh', [
  body('refreshToken').notEmpty().withMessage('Refresh token is required.')
], validate, authController.refresh);

router.get('/me', auth, authController.me);

module.exports = router;
