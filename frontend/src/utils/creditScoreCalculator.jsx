export class CreditScoreCalculator {
  // Calculate credit score based on user's loan history and repayment behavior
  static async calculateCreditScore(userId) {
    try {
      // Get user's loans
      const loansQuery = query(
        collection(db, "loans"),
        where("borrowerId", "==", userId)
      );
      
      const loansSnapshot = await getDocs(loansQuery);
      const loans = [];
      
      loansSnapshot.forEach((doc) => {
        loans.push({ id: doc.id, ...doc.data() });
      });
      
      // Default score for new users
      if (loans.length === 0) {
        return 650;
      }
      
      // Base score
      let score = 600;
      
      // Factors that improve score
      // 1. Number of completed loans
      const completedLoans = loans.filter(loan => loan.status === "completed");
      score += completedLoans.length * 15;
      
      // 2. On-time repayments
      let totalRepayments = 0;
      let lateRepayments = 0;
      
      loans.forEach(loan => {
        if (loan.repayments && loan.repayments.length > 0) {
          totalRepayments += loan.repayments.length;
          
          // Check for late repayments (would need actual due dates for real implementation)
          const lateInThisLoan = loan.repayments.filter(r => r.isLate).length;
          lateRepayments += lateInThisLoan;
        }
      });
      
      if (totalRepayments > 0) {
        const onTimeRate = (totalRepayments - lateRepayments) / totalRepayments;
        score += Math.round(onTimeRate * 100);
      }
      
      // 3. Loan amounts successfully repaid
      const totalRepaidAmount = completedLoans.reduce((sum, loan) => sum + loan.amount, 0);
      if (totalRepaidAmount > 0) {
        // Add points based on repaid amounts (capped)
        score += Math.min(Math.floor(totalRepaidAmount / 1000), 50);
      }
      
      // Factors that decrease score
      // 1. Defaults
      const defaultedLoans = loans.filter(loan => loan.status === "defaulted");
      score -= defaultedLoans.length * 100;
      
      // 2. Late repayments penalty
      score -= lateRepayments * 5;
      
      // Ensure score is within boundaries
      score = Math.max(300, Math.min(score, 850));
      
      return score;
    } catch (error) {
      console.error("Error calculating credit score:", error);
      // Return default score if calculation fails
      return 650;
    }
  }
  
  // Get credit score description
  static getCreditScoreDescription(score) {
    if (score >= 800) return "Excellent";
    if (score >= 740) return "Very Good";
    if (score >= 670) return "Good";
    if (score >= 580) return "Fair";
    return "Poor";
  }
  
  // Get loan eligibility based on credit score
  static getLoanEligibility(score) {
    if (score >= 750) {
      return {
        maxAmount: 50000,
        interestRate: 6.5,
        eligibleTerms: [12, 24, 36, 48, 60]
      };
    } else if (score >= 700) {
      return {
        maxAmount: 35000,
        interestRate: 8.5,
        eligibleTerms: [12, 24, 36, 48]
      };
    } else if (score >= 650) {
      return {
        maxAmount: 20000,
        interestRate: 11,
        eligibleTerms: [12, 24, 36]
      };
    } else if (score >= 600) {
      return {
        maxAmount: 10000,
        interestRate: 14,
        eligibleTerms: [12, 24]
      };
    } else {
      return {
        maxAmount: 5000,
        interestRate: 18,
        eligibleTerms: [12]
      };
    }
  }
}