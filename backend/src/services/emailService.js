const sgMail = require('@sendgrid/mail');

class EmailService {
  constructor() {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  }

  async sendEmail(to, subject, content) {
    try {
      const msg = {
        to,
        from: process.env.SENDGRID_FROM_EMAIL,
        subject,
        html: content,
      };

      await sgMail.send(msg);
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  // Loan application notifications
  async sendLoanApplicationConfirmation(user, loanDetails) {
    const subject = 'Loan Application Received';
    const content = `
      <h2>Dear ${user.firstName},</h2>
      <p>We have received your loan application for ${loanDetails.amount} with the following details:</p>
      <ul>
        <li>Loan Amount: $${loanDetails.amount}</li>
        <li>Term: ${loanDetails.term} days</li>
        <li>Purpose: ${loanDetails.purpose}</li>
      </ul>
      <p>We will review your application and get back to you shortly.</p>
      <p>Best regards,<br>Your Lending Team</p>
    `;

    return this.sendEmail(user.email, subject, content);
  }

  async sendLoanApprovalNotification(user, loanDetails) {
    const subject = 'Loan Application Approved';
    const content = `
      <h2>Congratulations ${user.firstName}!</h2>
      <p>Your loan application has been approved with the following terms:</p>
      <ul>
        <li>Loan Amount: $${loanDetails.amount}</li>
        <li>Term: ${loanDetails.term} days</li>
        <li>Interest Rate: ${loanDetails.interestRate * 100}%</li>
        <li>Total Repayment Amount: $${loanDetails.totalRepaymentAmount}</li>
      </ul>
      <p>Please log in to your account to review and accept the loan terms.</p>
      <p>Best regards,<br>Your Lending Team</p>
    `;

    return this.sendEmail(user.email, subject, content);
  }

  async sendLoanRejectionNotification(user, reason) {
    const subject = 'Loan Application Status Update';
    const content = `
      <h2>Dear ${user.firstName},</h2>
      <p>We have reviewed your loan application and regret to inform you that we cannot approve it at this time.</p>
      <p>Reason: ${reason}</p>
      <p>You can apply again after addressing the following:</p>
      <ul>
        ${this.formatRejectionReasons(reason)}
      </ul>
      <p>Best regards,<br>Your Lending Team</p>
    `;

    return this.sendEmail(user.email, subject, content);
  }

  // Payment notifications
  async sendPaymentReminder(user, payment) {
    const subject = 'Payment Reminder';
    const content = `
      <h2>Dear ${user.firstName},</h2>
      <p>This is a reminder that your loan payment of $${payment.amount} is due on ${new Date(payment.dueDate).toLocaleDateString()}.</p>
      <p>Payment details:</p>
      <ul>
        <li>Amount Due: $${payment.amount}</li>
        <li>Due Date: ${new Date(payment.dueDate).toLocaleDateString()}</li>
        <li>Loan ID: ${payment.loanId}</li>
      </ul>
      <p>Please ensure your account has sufficient funds for the automatic deduction.</p>
      <p>Best regards,<br>Your Lending Team</p>
    `;

    return this.sendEmail(user.email, subject, content);
  }

  async sendPaymentConfirmation(user, payment) {
    const subject = 'Payment Confirmation';
    const content = `
      <h2>Dear ${user.firstName},</h2>
      <p>We have received your payment of $${payment.amount}.</p>
      <p>Payment details:</p>
      <ul>
        <li>Amount Paid: $${payment.amount}</li>
        <li>Payment Date: ${new Date(payment.paidDate).toLocaleDateString()}</li>
        <li>Loan ID: ${payment.loanId}</li>
        <li>Remaining Balance: $${payment.remainingAmount}</li>
      </ul>
      <p>Thank you for your prompt payment.</p>
      <p>Best regards,<br>Your Lending Team</p>
    `;

    return this.sendEmail(user.email, subject, content);
  }

  async sendLatePaymentNotification(user, payment) {
    const subject = 'Late Payment Notice';
    const content = `
      <h2>Dear ${user.firstName},</h2>
      <p>Your loan payment of $${payment.amount} was due on ${new Date(payment.dueDate).toLocaleDateString()} and is now overdue.</p>
      <p>Please make the payment as soon as possible to avoid additional late fees and negative impact on your credit score.</p>
      <p>Payment details:</p>
      <ul>
        <li>Amount Due: $${payment.amount}</li>
        <li>Original Due Date: ${new Date(payment.dueDate).toLocaleDateString()}</li>
        <li>Late Fees: $${payment.lateFees}</li>
        <li>Total Amount Due: $${payment.amount + payment.lateFees}</li>
      </ul>
      <p>If you're having difficulty making payments, please contact our support team.</p>
      <p>Best regards,<br>Your Lending Team</p>
    `;

    return this.sendEmail(user.email, subject, content);
  }

  // Loan completion notification
  async sendLoanCompletionNotification(user, loanDetails) {
    const subject = 'Loan Successfully Repaid';
    const content = `
      <h2>Congratulations ${user.firstName}!</h2>
      <p>You have successfully repaid your loan. Here's a summary of your loan:</p>
      <ul>
        <li>Original Loan Amount: $${loanDetails.amount}</li>
        <li>Total Amount Paid: $${loanDetails.totalAmountPaid}</li>
        <li>Completion Date: ${new Date(loanDetails.completionDate).toLocaleDateString()}</li>
      </ul>
      <p>Thank you for choosing our lending platform. Your timely payments have positively impacted your credit score.</p>
      <p>Best regards,<br>Your Lending Team</p>
    `;

    return this.sendEmail(user.email, subject, content);
  }

  // Helper methods
  formatRejectionReasons(reason) {
    const reasons = Array.isArray(reason) ? reason : [reason];
    return reasons.map(r => `<li>${r}</li>`).join('');
  }
}

module.exports = new EmailService(); 