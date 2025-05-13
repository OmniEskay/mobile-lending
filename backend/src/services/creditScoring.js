const User = require('../models/User');
const Loan = require('../models/Loan');

class CreditScoringService {
  static async calculateCreditScore(userId) {
    try {
      const user = await User.findById(userId).populate('loanHistory');
      
      // Base score
      let score = 600;
      
      // Factors and their weights
      const weights = {
        paymentHistory: 0.35,
        loanUtilization: 0.30,
        creditHistory: 0.15,
        newCredit: 0.10,
        creditMix: 0.10
      };

      // Calculate payment history score
      const paymentHistoryScore = await this.calculatePaymentHistoryScore(user.loanHistory);
      score += paymentHistoryScore * weights.paymentHistory;

      // Calculate loan utilization score
      const utilizationScore = await this.calculateUtilizationScore(user.loanHistory);
      score += utilizationScore * weights.loanUtilization;

      // Calculate credit history length score
      const creditHistoryScore = this.calculateCreditHistoryScore(user);
      score += creditHistoryScore * weights.creditHistory;

      // Calculate new credit score
      const newCreditScore = await this.calculateNewCreditScore(user.loanHistory);
      score += newCreditScore * weights.newCredit;

      // Calculate credit mix score
      const creditMixScore = this.calculateCreditMixScore(user.loanHistory);
      score += creditMixScore * weights.creditMix;

      // Ensure score is within bounds
      score = Math.max(300, Math.min(850, Math.round(score)));

      return {
        score,
        factors: this.getScoreFactors(score),
        details: {
          paymentHistory: paymentHistoryScore,
          utilization: utilizationScore,
          creditHistory: creditHistoryScore,
          newCredit: newCreditScore,
          creditMix: creditMixScore
        }
      };
    } catch (error) {
      console.error('Error calculating credit score:', error);
      throw error;
    }
  }

  static async calculatePaymentHistoryScore(loanHistory) {
    if (!loanHistory.length) return 0;

    let onTimePayments = 0;
    let totalPayments = 0;

    for (const loan of loanHistory) {
      const payments = loan.repaymentSchedule.filter(payment => 
        payment.status === 'paid' || payment.status === 'overdue'
      );
      
      totalPayments += payments.length;
      onTimePayments += payments.filter(payment => 
        payment.status === 'paid' && 
        new Date(payment.paidDate) <= new Date(payment.dueDate)
      ).length;
    }

    return totalPayments === 0 ? 0 : (onTimePayments / totalPayments) * 100;
  }

  static async calculateUtilizationScore(loanHistory) {
    if (!loanHistory.length) return 0;

    const activeLoans = loanHistory.filter(loan => 
      loan.status === 'active' || loan.status === 'funded'
    );

    const totalLoanAmount = activeLoans.reduce((sum, loan) => sum + loan.amount, 0);
    const totalRepaidAmount = activeLoans.reduce((sum, loan) => sum + loan.totalAmountPaid, 0);
    
    const utilization = totalLoanAmount === 0 ? 0 : totalRepaidAmount / totalLoanAmount;
    return (1 - utilization) * 100; // Lower utilization is better
  }

  static calculateCreditHistoryScore(user) {
    const accountAge = (new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24 * 365); // in years
    return Math.min(100, accountAge * 20); // 5 years for max score
  }

  static async calculateNewCreditScore(loanHistory) {
    const recentLoans = loanHistory.filter(loan => {
      const loanAge = (new Date() - new Date(loan.applicationDate)) / (1000 * 60 * 60 * 24);
      return loanAge <= 30; // loans in last 30 days
    });

    return Math.max(0, 100 - (recentLoans.length * 20)); // Each recent loan reduces score
  }

  static calculateCreditMixScore(loanHistory) {
    if (!loanHistory.length) return 0;

    const purposes = new Set(loanHistory.map(loan => loan.purpose));
    return Math.min(100, purposes.size * 25); // More diverse purposes = better score
  }

  static getScoreFactors(score) {
    const factors = [];

    if (score < 580) {
      factors.push(
        'Poor payment history',
        'High loan utilization',
        'Limited credit history'
      );
    } else if (score < 670) {
      factors.push(
        'Recent late payments',
        'Multiple recent loan applications',
        'Limited credit mix'
      );
    } else if (score < 740) {
      factors.push(
        'Good payment history',
        'Moderate loan utilization',
        'Growing credit history'
      );
    } else if (score < 800) {
      factors.push(
        'Excellent payment history',
        'Low loan utilization',
        'Diverse credit mix'
      );
    } else {
      factors.push(
        'Perfect payment history',
        'Very low loan utilization',
        'Extensive credit history',
        'Optimal credit mix'
      );
    }

    return factors;
  }

  static async assessLoanRisk(userId, loanAmount, term) {
    try {
      const creditScore = await this.calculateCreditScore(userId);
      const user = await User.findById(userId).populate('loanHistory');

      const riskFactors = [];
      let riskScore = 0;

      // Credit score weight
      riskScore += (creditScore.score - 300) / (850 - 300) * 40;

      // Payment history
      const paymentHistory = await this.calculatePaymentHistoryScore(user.loanHistory);
      riskScore += paymentHistory * 0.3;

      // Loan amount relative to history
      const maxPreviousLoan = Math.max(...user.loanHistory.map(loan => loan.amount), 0);
      if (loanAmount > maxPreviousLoan * 1.5) {
        riskFactors.push('Loan amount significantly higher than previous loans');
        riskScore -= 10;
      }

      // Active loans
      const activeLoans = user.loanHistory.filter(loan => 
        loan.status === 'active' || loan.status === 'funded'
      ).length;
      if (activeLoans > 0) {
        riskFactors.push(`Has ${activeLoans} active loan(s)`);
        riskScore -= activeLoans * 5;
      }

      // Normalize risk score
      riskScore = Math.max(0, Math.min(100, riskScore));

      return {
        score: riskScore,
        recommendation: this.getRiskRecommendation(riskScore),
        factors: riskFactors,
        creditScore: creditScore.score
      };
    } catch (error) {
      console.error('Error assessing loan risk:', error);
      throw error;
    }
  }

  static getRiskRecommendation(riskScore) {
    if (riskScore >= 80) return 'Low Risk - Approve';
    if (riskScore >= 60) return 'Moderate Risk - Consider Approval';
    if (riskScore >= 40) return 'High Risk - Additional Verification Required';
    return 'Very High Risk - Not Recommended';
  }
}

module.exports = CreditScoringService; 