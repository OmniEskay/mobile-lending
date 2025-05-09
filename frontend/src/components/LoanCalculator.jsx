import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { CreditScoreCalculator } from '../utils/creditScoreCalculator';

export default function LoanCalculator() {
  const { userProfile } = useAuth();
  const [loanAmount, setLoanAmount] = useState(5000);
  const [loanTerm, setLoanTerm] = useState(12);
  const [interestRate, setInterestRate] = useState(10);
  const [monthlyPayment, setMonthlyPayment] = useState(0);
  const [totalPayment, setTotalPayment] = useState(0);
  const [eligibility, setEligibility] = useState(null);
  
  useEffect(() => {
    if (userProfile && userProfile.creditScore) {
      const eligibility = CreditScoreCalculator.getLoanEligibility(userProfile.creditScore);
      setEligibility(eligibility);
      setInterestRate(eligibility.interestRate);
    }
  }, [userProfile]);
  
  useEffect(() => {
    calculateLoan();
  }, [loanAmount, loanTerm, interestRate]);
  
  const calculateLoan = () => {
    // Convert annual interest rate to monthly
    const monthlyRate = interestRate / 100 / 12;
    
    // Calculate monthly payment
    const payment = loanAmount * monthlyRate * Math.pow(1 + monthlyRate, loanTerm) / 
                   (Math.pow(1 + monthlyRate, loanTerm) - 1);
    
    setMonthlyPayment(payment.toFixed(2));
    setTotalPayment((payment * loanTerm).toFixed(2));
  };
  
  return (
    <div className="loan-calculator p-4 border rounded-lg shadow-sm bg-white">
      <h2 className="text-xl font-semibold mb-4">Loan Calculator</h2>
      
      {userProfile && userProfile.creditScore && (
        <div className="mb-4 p-3 bg-blue-50 rounded">
          <p className="font-medium">
            Your Credit Score: {userProfile.creditScore} 
            ({CreditScoreCalculator.getCreditScoreDescription(userProfile.creditScore)})
          </p>
          {eligibility && (
            <p className="text-sm text-gray-600">
              You may qualify for loans up to ${eligibility.maxAmount} 
              at {eligibility.interestRate}% interest rate
            </p>
          )}
        </div>
      )}
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Loan Amount</label>
        <input
          type="range"
          min={1000}
          max={eligibility ? eligibility.maxAmount : 50000}
          step={500}
          value={loanAmount}
          onChange={(e) => setLoanAmount(Number(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-sm text-gray-600">
          <span>$1,000</span>
          <span>${loanAmount}</span>
          <span>${eligibility ? eligibility.maxAmount : 50000}</span>
        </div>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Loan Term (months)</label>
        <select
          value={loanTerm}
          onChange={(e) => setLoanTerm(Number(e.target.value))}
          className="w-full p-2 border rounded"
        >
          {eligibility?.eligibleTerms.map(term => (
            <option key={term} value={term}>{term} months</option>
          ))}
          {!eligibility && (
            <>
              <option value={12}>12 months</option>
              <option value={24}>24 months</option>
              <option value={36}>36 months</option>
              <option value={48}>48 months</option>
              <option value={60}>60 months</option>
            </>
          )}
        </select>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Interest Rate: {interestRate}%</label>
        <input
          type="range"
          min={5}
          max={20}
          step={0.5}
          value={interestRate}
          onChange={(e) => setInterestRate(Number(e.target.value))}
          className="w-full"
          disabled={eligibility !== null}
        />
      </div>
      
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex justify-between mb-2">
          <span className="font-medium">Monthly Payment:</span>
          <span className="font-semibold">${monthlyPayment}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Total Payment:</span>
          <span className="font-semibold">${totalPayment}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>Total Interest:</span>
          <span>${(totalPayment - loanAmount).toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}