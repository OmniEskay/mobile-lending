const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
const { body } = require('express-validator');
const validate = require('../middleware/validate');

// Register user
router.post(
  '/register',
  [
    body('firstName')
      .trim()
      .notEmpty()
      .withMessage('First name is required'),
    body('lastName')
      .trim()
      .notEmpty()
      .withMessage('Last name is required'),
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
    body('phoneNumber')
      .matches(/^\+?[\d\s-]+$/)
      .withMessage('Please enter a valid phone number'),
    body('role')
      .isIn(['borrower', 'lender'])
      .withMessage('Role must be either borrower or lender')
  ],
  validate,
  authController.register
);

// Login user
router.post(
  '/login',
  [
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email'),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
  ],
  validate,
  authController.login
);

// Verify email
router.get(
  '/verify-email/:token',
  authController.verifyEmail
);

// Get current user
router.get(
  '/me',
  auth,
  authController.getCurrentUser
);

// Update profile
router.put(
  '/profile',
  auth,
  [
    body('firstName')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('First name cannot be empty'),
    body('lastName')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Last name cannot be empty'),
    body('phoneNumber')
      .optional()
      .matches(/^\+?[\d\s-]+$/)
      .withMessage('Please enter a valid phone number'),
    body('address.street')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Street address cannot be empty'),
    body('address.city')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('City cannot be empty'),
    body('address.state')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('State cannot be empty'),
    body('address.postalCode')
      .optional()
      .trim()
      .matches(/^[0-9]{5}(-[0-9]{4})?$/)
      .withMessage('Please enter a valid postal code'),
    body('address.country')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Country cannot be empty')
  ],
  validate,
  authController.updateProfile
);

// Change password
router.put(
  '/change-password',
  auth,
  [
    body('currentPassword')
      .notEmpty()
      .withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('New password must be at least 8 characters long')
      .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/)
      .withMessage('New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
  ],
  validate,
  authController.changePassword
);

// Request password reset
router.post(
  '/forgot-password',
  [
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email')
  ],
  validate,
  authController.requestPasswordReset
);

// Reset password
router.post(
  '/reset-password',
  [
    body('token')
      .notEmpty()
      .withMessage('Token is required'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('New password must be at least 8 characters long')
      .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/)
      .withMessage('New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
  ],
  validate,
  authController.resetPassword
);

module.exports = router; 