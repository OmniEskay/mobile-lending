import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LoanModel } from '../models/LoanModel';
import { NotificationService } from '../utils/notificationService';
import { useNavigate } from 'react-router-dom';

export default function LoanApplicationForm() {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  
  const [amount, setAmount] = useState(5000);
  const [term, setTerm] = useState(12);
  const [purpose, setPurpose] = useState('');
  const [employmentStatus, setEmploymentStatus] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!userProfile?.isVerified) {
      setError("Your account needs to be verified before applying for loans.");
      return;
    }
    
    setError('');
    setLoading(true);
    
    try {
      const loanData = {
        amount: Number(amount),
        term: Number(term),
        purpose,
        employmentStatus,
        monthlyIncome: Number(monthlyIncome),
        borrowerId: currentUser.uid,
        borrowerName: userProfile.fullName,
        interestRate: CreditScoreCalculator.getLoanEligibility(userProfile.creditScore).interestRate,
        expectedMonthlyPayment: calculateMonthlyPayment(amount, term, CreditScoreCalculator.getLoanEligibility(userProfile.creditScore).interestRate)
      };
      
      const loanId = await LoanModel.applyForLoan(loanData);
      
      // Send email notification
      await NotificationService.sendLoanApplicationConfirmation(
        currentUser.uid,
        loanData
      );
      
      navigate('/dashboard');
    } catch (error) {
      console.error("Error applying for loan:", error);
      setError("Failed to submit loan application. Please try again.");
    }
    
    setLoading(false);
  };
  
  const calculateMonthlyPayment = (amount, term, interestRate) => {
    const monthlyRate = interestRate / 100 / 12;
    const payment = amount * monthlyRate * Math.pow(1 + monthlyRate, term) / 
                   (Math.pow(1 + monthlyRate, term) - 1);
    return payment.toFixed(2);
  };
  
  if (!userProfile) {
    return <div>Loading profile information...</div>;
  }
  
  const eligibility = CreditScoreCalculator.getLoanEligibility(userProfile.creditScore);
  
  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6">Apply for a Loan</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <p className="font-medium">
          Your Credit Score: {userProfile.creditScore} 
          ({CreditScoreCalculator.getCreditScoreDescription(userProfile.creditScore)})
        </p>
        <p className="text-sm text-gray-600 mt-1">
          Based on your credit score, you qualify for:
        </p>
        <ul className="text-sm mt-1">
          <li>• Maximum loan amount: ${eligibility.maxAmount}</li>
          <li>• Maximum loan amount: ${eligibility.maxAmount}</li>
          <li>• Interest rate: {eligibility.interestRate}%</li>
          <li>• Maximum term: {eligibility.maxTerm} months</li>
        </ul>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium mb-1">Loan Amount ($)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="100"
            max={eligibility.maxAmount}
            required
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Loan Term (months)</label>
          <input
            type="number"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            min="6"
            max={eligibility.maxTerm}
            required
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Purpose of Loan</label>
          <input
            type="text"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            required
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Employment Status</label>
          <select
            value={employmentStatus}
            onChange={(e) => setEmploymentStatus(e.target.value)}
            required
            className="w-full border px-3 py-2 rounded"
          >
            <option value="">Select</option>
            <option value="employed">Employed</option>
            <option value="self-employed">Self-employed</option>
            <option value="unemployed">Unemployed</option>
            <option value="student">Student</option>
            <option value="retired">Retired</option>
          </select>
        </div>

        <div>
          <label className="block font-medium mb-1">Monthly Income ($)</label>
          <input
            type="number"
            value={monthlyIncome}
            onChange={(e) => setMonthlyIncome(e.target.value)}
            min="0"
            required
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Submit Application'}
        </button>
      </form>
    </div>
  );
}
