import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  Timestamp,
  arrayUnion,
  increment
} from 'firebase/firestore';
import { db } from '../firebase/firebase';

export class LoanModel {
  // Create a new loan application
  static async applyForLoan(loanData) {
    try {
      const loanRef = await addDoc(collection(db, "loans"), {
        ...loanData,
        status: "pending",
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        investors: [],
        repayments: [],
        fundedAmount: 0,
        isFullyFunded: false,
        isDisbursed: false,
        isCompleted: false
      });
      
      // Add loan reference to user's loans array
      await updateDoc(doc(db, "users", loanData.borrowerId), {
        loans: arrayUnion(loanRef.id)
      });
      
      return loanRef.id;
    } catch (error) {
      console.error("Error applying for loan:", error);
      throw error;
    }
  }
  
  // Get loan by ID
  static async getLoanById(loanId) {
    try {
      const loanDoc = await getDoc(doc(db, "loans", loanId));
      if (loanDoc.exists()) {
        return { id: loanDoc.id, ...loanDoc.data() };
      }
      return null;
    } catch (error) {
      console.error("Error getting loan:", error);
      throw error;
    }
  }
  
  // Get loans by borrower ID
  static async getLoansByBorrowerId(borrowerId) {
    try {
      const loansQuery = query(
        collection(db, "loans"), 
        where("borrowerId", "==", borrowerId)
      );
      
      const loansSnapshot = await getDocs(loansQuery);
      const loans = [];
      
      loansSnapshot.forEach((doc) => {
        loans.push({ id: doc.id, ...doc.data() });
      });
      
      return loans;
    } catch (error) {
      console.error("Error getting loans:", error);
      throw error;
    }
  }
  
  // Get available loans for investment
  static async getAvailableLoans() {
    try {
      const loansQuery = query(
        collection(db, "loans"), 
        where("isFullyFunded", "==", false),
        where("status", "==", "approved")
      );
      
      const loansSnapshot = await getDocs(loansQuery);
      const loans = [];
      
      loansSnapshot.forEach((doc) => {
        loans.push({ id: doc.id, ...doc.data() });
      });
      
      return loans;
    } catch (error) {
      console.error("Error getting available loans:", error);
      throw error;
    }
  }
  
  // Invest in a loan
  static async investInLoan(loanId, investorId, amount) {
    try {
      // Get current loan data
      const loanDoc = await getDoc(doc(db, "loans", loanId));
      const loanData = loanDoc.data();
      
      if (!loanData || loanData.isFullyFunded) {
        throw new Error("Loan not available for investment");
      }
      
      // Calculate new funded amount
      const newFundedAmount = loanData.fundedAmount + amount;
      const isFullyFunded = newFundedAmount >= loanData.amount;
      
      // Update the loan with investment info
      await updateDoc(doc(db, "loans", loanId), {
        fundedAmount: newFundedAmount,
        isFullyFunded: isFullyFunded,
        investors: arrayUnion({
          investorId,
          amount,
          date: Timestamp.now()
        }),
        updatedAt: Timestamp.now()
      });
      
      // Add investment to user's investments array
      await updateDoc(doc(db, "users", investorId), {
        investments: arrayUnion({
          loanId,
          amount,
          date: Timestamp.now()
        })
      });
      
      // If loan is fully funded, change status
      if (isFullyFunded) {
        await updateDoc(doc(db, "loans", loanId), {
          status: "funded"
        });
      }
      
      return { success: true };
    } catch (error) {
      console.error("Error investing in loan:", error);
      throw error;
    }
  }
  
  // Record loan repayment
  static async recordRepayment(loanId, amount) {
    try {
      const repayment = {
        amount,
        date: Timestamp.now(),
        status: "completed"
      };
      
      await updateDoc(doc(db, "loans", loanId), {
        repayments: arrayUnion(repayment),
        repaidAmount: increment(amount),
        updatedAt: Timestamp.now()
      });
      
      // Check if loan is fully repaid
      const updatedLoanDoc = await getDoc(doc(db, "loans", loanId));
      const loanData = updatedLoanDoc.data();
      
      if (loanData.repaidAmount >= loanData.amount) {
        await updateDoc(doc(db, "loans", loanId), {
          status: "completed",
          isCompleted: true
        });
      }
      
      return { success: true };
    } catch (error) {
      console.error("Error recording repayment:", error);
      throw error;
    }
  }
  
  // Approve loan application
  static async approveLoan(loanId) {
    try {
      await updateDoc(doc(db, "loans", loanId), {
        status: "approved",
        updatedAt: Timestamp.now()
      });
      
      return { success: true };
    } catch (error) {
      console.error("Error approving loan:", error);
      throw error;
    }
  }
  
  // Reject loan application
  static async rejectLoan(loanId, reason) {
    try {
      await updateDoc(doc(db, "loans", loanId), {
        status: "rejected",
        rejectionReason: reason,
        updatedAt: Timestamp.now()
      });
      
      return { success: true };
    } catch (error) {
      console.error("Error rejecting loan:", error);
      throw error;
    }
  }
}