const Loan = require('../models/Loan');
const User = require('../models/User');
const CreditScoringService = require('../services/creditScoring');
const emailService = require('../services/emailService');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

class LoanController {
  // Apply for a loan
  async applyForLoan(req, res) {
    try {
      const { amount, term, purpose } = req.body;
      const borrowerId = req.user.id;

      // Validate loan amount and term
      if (amount < process.env.MIN_LOAN_AMOUNT || amount > process.env.MAX_LOAN_AMOUNT) {
        return res.status(400).json({
          success: false,
          message: `Loan amount must be between $${process.env.MIN_LOAN_AMOUNT} and $${process.env.MAX_LOAN_AMOUNT}`
        });
      }

      // Get borrower's credit score and assess risk
      const riskAssessment = await CreditScoringService.assessLoanRisk(
        borrowerId,
        amount,
        term
      );

      // Create loan application
      const loan = new Loan({
        borrower: borrowerId,
        amount,
        term,
        purpose,
        interestRate: this.calculateInterestRate(riskAssessment.score),
        creditScoreAtApplication: riskAssessment.creditScore,
        riskAssessment: {
          score: riskAssessment.score,
          factors: riskAssessment.factors,
          recommendation: riskAssessment.recommendation
        }
      });

      await loan.save();

      // Update user's loan history
      await User.findByIdAndUpdate(borrowerId, {
        $push: { loanHistory: loan._id }
      });

      // Send confirmation email
      const borrower = await User.findById(borrowerId);
      await emailService.sendLoanApplicationConfirmation(borrower, loan);

      return res.status(201).json({
        success: true,
        message: 'Loan application submitted successfully',
        loan
      });
    } catch (error) {
      console.error('Error in loan application:', error);
      return res.status(500).json({
        success: false,
        message: 'Error processing loan application',
        error: error.message
      });
    }
  }

  // Approve or reject a loan
  async processLoanApplication(req, res) {
    try {
      const { loanId } = req.params;
      const { action, reason } = req.body;

      const loan = await Loan.findById(loanId).populate('borrower');
      if (!loan) {
        return res.status(404).json({
          success: false,
          message: 'Loan not found'
        });
      }

      if (action === 'approve') {
        loan.status = 'approved';
        loan.approvalDate = new Date();
        await emailService.sendLoanApprovalNotification(loan.borrower, loan);
      } else if (action === 'reject') {
        loan.status = 'rejected';
        await emailService.sendLoanRejectionNotification(loan.borrower, reason);
      } else {
        return res.status(400).json({
          success: false,
          message: 'Invalid action'
        });
      }

      await loan.save();

      return res.status(200).json({
        success: true,
        message: `Loan ${action}ed successfully`,
        loan
      });
    } catch (error) {
      console.error('Error processing loan application:', error);
      return res.status(500).json({
        success: false,
        message: 'Error processing loan application',
        error: error.message
      });
    }
  }

  // Disburse loan
  async disburseLoan(req, res) {
    try {
      const { loanId } = req.params;
      const loan = await Loan.findById(loanId).populate('borrower');

      if (!loan) {
        return res.status(404).json({
          success: false,
          message: 'Loan not found'
        });
      }

      if (loan.status !== 'approved') {
        return res.status(400).json({
          success: false,
          message: 'Loan must be approved before disbursement'
        });
      }

      // Create transfer using Stripe
      const transfer = await stripe.transfers.create({
        amount: loan.amount * 100, // Stripe expects amount in cents
        currency: 'usd',
        destination: loan.borrower.stripeAccountId,
        description: `Loan disbursement for loan ${loan._id}`
      });

      // Update loan status and disbursement details
      loan.status = 'funded';
      loan.disbursementDate = new Date();
      loan.disbursementDetails = {
        transactionId: transfer.id,
        date: new Date(),
        status: 'completed'
      };

      // Create repayment schedule
      await loan.createRepaymentSchedule();
      await loan.save();

      return res.status(200).json({
        success: true,
        message: 'Loan disbursed successfully',
        loan
      });
    } catch (error) {
      console.error('Error disbursing loan:', error);
      return res.status(500).json({
        success: false,
        message: 'Error disbursing loan',
        error: error.message
      });
    }
  }

  // Process loan repayment
  async processRepayment(req, res) {
    try {
      const { loanId } = req.params;
      const { amount } = req.body;

      const loan = await Loan.findById(loanId).populate('borrower');
      if (!loan) {
        return res.status(404).json({
          success: false,
          message: 'Loan not found'
        });
      }

      // Find the current pending payment
      const currentPayment = loan.repaymentSchedule.find(p => p.status === 'pending');
      if (!currentPayment) {
        return res.status(400).json({
          success: false,
          message: 'No pending payments found'
        });
      }

      // Process payment using Stripe
      const payment = await stripe.charges.create({
        amount: amount * 100, // Stripe expects amount in cents
        currency: 'usd',
        customer: loan.borrower.stripeCustomerId,
        description: `Loan repayment for loan ${loan._id}`
      });

      // Update payment status
      currentPayment.status = 'paid';
      currentPayment.paidDate = new Date();
      currentPayment.paidAmount = amount;

      // Update loan details
      loan.totalAmountPaid += amount;
      loan.remainingAmount -= amount;
      loan.lastRepaymentDate = new Date();

      // Find next payment and update nextRepaymentDate
      const nextPayment = loan.repaymentSchedule.find(p => p.status === 'pending');
      loan.nextRepaymentDate = nextPayment ? nextPayment.dueDate : null;

      // Check if loan is fully repaid
      if (loan.remainingAmount <= 0) {
        loan.status = 'completed';
        loan.completionDate = new Date();
        await emailService.sendLoanCompletionNotification(loan.borrower, loan);
      }

      await loan.save();

      // Send payment confirmation
      await emailService.sendPaymentConfirmation(loan.borrower, {
        amount,
        paidDate: new Date(),
        loanId: loan._id,
        remainingAmount: loan.remainingAmount
      });

      return res.status(200).json({
        success: true,
        message: 'Payment processed successfully',
        loan
      });
    } catch (error) {
      console.error('Error processing repayment:', error);
      return res.status(500).json({
        success: false,
        message: 'Error processing repayment',
        error: error.message
      });
    }
  }

  // Get loan details
  async getLoanDetails(req, res) {
    try {
      const { loanId } = req.params;
      const loan = await Loan.findById(loanId)
        .populate('borrower', '-password')
        .populate('lender', '-password');

      if (!loan) {
        return res.status(404).json({
          success: false,
          message: 'Loan not found'
        });
      }

      return res.status(200).json({
        success: true,
        loan
      });
    } catch (error) {
      console.error('Error fetching loan details:', error);
      return res.status(500).json({
        success: false,
        message: 'Error fetching loan details',
        error: error.message
      });
    }
  }

  // Helper method to calculate interest rate based on risk score
  calculateInterestRate(riskScore) {
    // Base interest rate
    const baseRate = 0.10;
    
    // Risk premium based on risk score (0-100)
    const riskPremium = (100 - riskScore) / 100 * 0.15;
    
    return Math.min(baseRate + riskPremium, 0.30); // Cap at 30%
  }
}

module.exports = new LoanController(); 