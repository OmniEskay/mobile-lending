import { functions } from '../firebase/firebase';
import { httpsCallable } from 'firebase/functions';

export class NotificationService {
  // Send email notification
  static async sendEmail(recipient, templateId, data) {
    try {
      const sendEmailFunction = httpsCallable(functions, 'sendEmail');
      const result = await sendEmailFunction({
        recipient,
        templateId,
        data
      });
      
      return result.data;
    } catch (error) {
      console.error("Error sending email:", error);
      throw error;
    }
  }
  
  // Loan application confirmation
  static async sendLoanApplicationConfirmation(userId, loanDetails) {
    const user = await UserModel.getUserById(userId);
    
    if (!user || !user.email) throw new Error("User email not found");
    
    return this.sendEmail(
      user.email,
      'loan-application-confirmation',
      {
        userName: user.fullName,
        loanAmount: loanDetails.amount,
        loanTerm: loanDetails.term,
        applicationDate: new Date().toLocaleDateString()
      }
    );
  }
  
  // Loan approval notification
  static async sendLoanApprovalNotification(userId, loanId) {
    const user = await UserModel.getUserById(userId);
    const loan = await LoanModel.getLoanById(loanId);
    
    if (!user || !user.email) throw new Error("User email not found");
    
    return this.sendEmail(
      user.email,
      'loan-approval',
      {
        userName: user.fullName,
        loanAmount: loan.amount,
        loanTerm: loan.term,
        loanId: loanId
      }
    );
  }
  
  // Payment reminder
  static async sendPaymentReminder(userId, loanId, dueDate, amount) {
    const user = await UserModel.getUserById(userId);
    
    if (!user || !user.email) throw new Error("User email not found");
    
    return this.sendEmail(
      user.email,
      'payment-reminder',
      {
        userName: user.fullName,
        loanId: loanId,
        dueDate: dueDate.toLocaleDateString(),
        amount: amount
      }
    );
  }
  
  // Investment opportunity notification
  static async sendInvestmentOpportunityNotification(userIds, loanDetails) {
    try {
      const sendInvestmentNotification = httpsCallable(functions, 'sendInvestmentNotification');
      const result = await sendInvestmentNotification({
        userIds,
        loanDetails
      });
      
      return result.data;
    } catch (error) {
      console.error("Error sending investment notification:", error);
      throw error;
    }
  }
  
  // Repayment confirmation
  static async sendRepaymentConfirmation(userId, loanId, amount) {
    const user = await UserModel.getUserById(userId);
    
    if (!user || !user.email) throw new Error("User email not found");
    
    return this.sendEmail(
      user.email,
      'repayment-confirmation',
      {
        userName: user.fullName,
        loanId: loanId,
        amount: amount,
        date: new Date().toLocaleDateString()
      }
    );
  }
}
