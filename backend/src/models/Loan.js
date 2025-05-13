const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema({
  borrower: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  amount: {
    type: Number,
    required: true,
    min: 100
  },
  term: {
    type: Number,
    required: true,
    min: 1,
    description: 'Loan term in days'
  },
  interestRate: {
    type: Number,
    required: true,
    min: 0,
    max: 1,
    description: 'Interest rate as a decimal (e.g., 0.15 for 15%)'
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'funded', 'active', 'completed', 'defaulted', 'rejected'],
    default: 'pending'
  },
  purpose: {
    type: String,
    required: true,
    trim: true
  },
  repaymentSchedule: [{
    dueDate: Date,
    amount: Number,
    status: {
      type: String,
      enum: ['pending', 'paid', 'overdue'],
      default: 'pending'
    },
    paidDate: Date,
    paidAmount: Number
  }],
  creditScoreAtApplication: {
    type: Number,
    required: true
  },
  riskAssessment: {
    score: Number,
    factors: [String],
    recommendation: String
  },
  disbursementDetails: {
    transactionId: String,
    date: Date,
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending'
    }
  },
  documents: [{
    type: { 
      type: String, 
      enum: ['income_proof', 'bank_statement', 'employment_verification']
    },
    url: String,
    verified: { type: Boolean, default: false }
  }],
  applicationDate: {
    type: Date,
    default: Date.now
  },
  approvalDate: Date,
  disbursementDate: Date,
  completionDate: Date,
  lastRepaymentDate: Date,
  nextRepaymentDate: Date,
  totalAmountPaid: {
    type: Number,
    default: 0
  },
  remainingAmount: {
    type: Number,
    default: function() {
      return this.amount;
    }
  },
  lateFees: {
    type: Number,
    default: 0
  },
  notes: [{
    content: String,
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    date: {
      type: Date,
      default: Date.now
    }
  }]
});

// Calculate total repayment amount including interest
loanSchema.virtual('totalRepaymentAmount').get(function() {
  return this.amount * (1 + this.interestRate);
});

// Update loan status based on repayments
loanSchema.methods.updateLoanStatus = function() {
  const allPaid = this.repaymentSchedule.every(payment => payment.status === 'paid');
  if (allPaid) {
    this.status = 'completed';
    this.completionDate = new Date();
  }
  return this.save();
};

// Check if loan is overdue
loanSchema.methods.isOverdue = function() {
  const currentPayment = this.repaymentSchedule.find(payment => payment.status === 'pending');
  if (!currentPayment) return false;
  return new Date() > currentPayment.dueDate;
};

// Create repayment schedule
loanSchema.methods.createRepaymentSchedule = function() {
  const totalAmount = this.amount * (1 + this.interestRate);
  const installmentAmount = totalAmount / this.term;
  
  this.repaymentSchedule = [];
  for (let i = 0; i < this.term; i++) {
    const dueDate = new Date(this.disbursementDate);
    dueDate.setDate(dueDate.getDate() + (i + 1));
    
    this.repaymentSchedule.push({
      dueDate,
      amount: installmentAmount,
      status: 'pending'
    });
  }
  return this.save();
};

const Loan = mongoose.model('Loan', loanSchema);

module.exports = Loan; 