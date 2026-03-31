const express = require('express');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

const router = express.Router();

router.post('/register', [
  auth,
  authorize('admin'),
  body('name').trim().notEmpty().withMessage('Name is required.'),
  body('email').isEmail().withMessage('Valid email is required.'),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters.')
    .matches(/(?=.*[a-z])/).withMessage('Password must contain at least one lowercase letter.')
    .matches(/(?=.*[A-Z])/).withMessage('Password must contain at least one uppercase letter.')
    .matches(/(?=.*[0-9])/).withMessage('Password must contain at least one number.')
    .matches(/(?=.*[^a-zA-Z0-9])/).withMessage('Password must contain at least one special character.')
    .not().matches(/\s/).withMessage('Password must not contain spaces.'),
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

router.post('/verify-email', [
  body('token').notEmpty().withMessage('Token is required.')
], validate, authController.verifyEmail);

router.post('/resend-verification', [
  body('email').isEmail().withMessage('Valid email is required.')
], validate, authController.resendVerification);

router.post('/forgot-password', [
  body('email').isEmail().withMessage('Valid email is required.')
], validate, authController.forgotPassword);

router.post('/reset-password', [
  body('token').notEmpty().withMessage('Token is required.'),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters.')
    .matches(/(?=.*[a-z])/).withMessage('Password must contain at least one lowercase letter.')
    .matches(/(?=.*[A-Z])/).withMessage('Password must contain at least one uppercase letter.')
    .matches(/(?=.*[0-9])/).withMessage('Password must contain at least one number.')
    .matches(/(?=.*[^a-zA-Z0-9])/).withMessage('Password must contain at least one special character.')
], validate, authController.resetPassword);

router.get('/me', auth, authController.me);
router.post('/logout', auth, authController.logout);

module.exports = router;
