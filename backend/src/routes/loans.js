const express = require('express');
const router = express.Router();
const loanController = require('../controllers/loanController');
const auth = require('../middleware/auth');
const { body, param } = require('express-validator');
const validate = require('../middleware/validate');

// Apply for a loan
router.post(
  '/apply',
  auth,
  [
    body('amount')
      .isFloat({ min: 100 })
      .withMessage('Amount must be at least $100'),
    body('term')
      .isInt({ min: 1 })
      .withMessage('Term must be at least 1 day'),
    body('purpose')
      .isString()
      .trim()
      .notEmpty()
      .withMessage('Loan purpose is required')
  ],
  validate,
  loanController.applyForLoan
);

// Process loan application (approve/reject)
router.put(
  '/:loanId/process',
  auth,
  [
    param('loanId')
      .isMongoId()
      .withMessage('Invalid loan ID'),
    body('action')
      .isIn(['approve', 'reject'])
      .withMessage('Action must be either approve or reject'),
    body('reason')
      .if(body('action').equals('reject'))
      .isString()
      .notEmpty()
      .withMessage('Reason is required for rejection')
  ],
  validate,
  loanController.processLoanApplication
);

// Disburse loan
router.post(
  '/:loanId/disburse',
  auth,
  [
    param('loanId')
      .isMongoId()
      .withMessage('Invalid loan ID')
  ],
  validate,
  loanController.disburseLoan
);

// Process loan repayment
router.post(
  '/:loanId/repay',
  auth,
  [
    param('loanId')
      .isMongoId()
      .withMessage('Invalid loan ID'),
    body('amount')
      .isFloat({ min: 0.01 })
      .withMessage('Amount must be greater than 0')
  ],
  validate,
  loanController.processRepayment
);

// Get loan details
router.get(
  '/:loanId',
  auth,
  [
    param('loanId')
      .isMongoId()
      .withMessage('Invalid loan ID')
  ],
  validate,
  loanController.getLoanDetails
);

// Get user's loans (as borrower)
router.get(
  '/borrower/me',
  auth,
  async (req, res) => {
    try {
      const loans = await Loan.find({ borrower: req.user.id })
        .populate('lender', '-password')
        .sort('-applicationDate');

      res.json({
        success: true,
        loans
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching loans',
        error: error.message
      });
    }
  }
);

// Get user's loans (as lender)
router.get(
  '/lender/me',
  auth,
  async (req, res) => {
    try {
      const loans = await Loan.find({ lender: req.user.id })
        .populate('borrower', '-password')
        .sort('-applicationDate');

      res.json({
        success: true,
        loans
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching loans',
        error: error.message
      });
    }
  }
);

// Get available loans for lending
router.get(
  '/available',
  auth,
  async (req, res) => {
    try {
      const loans = await Loan.find({
        status: 'pending',
        lender: { $exists: false }
      })
        .populate('borrower', '-password')
        .sort('-applicationDate');

      res.json({
        success: true,
        loans
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching available loans',
        error: error.message
      });
    }
  }
);

module.exports = router; 