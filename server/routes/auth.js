const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required.'),
  body('email').isEmail().withMessage('Valid email is required.'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters.')
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
