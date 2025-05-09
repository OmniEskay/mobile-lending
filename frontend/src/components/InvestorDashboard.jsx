import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function InvestorDashboard({ investments }) {
  const [activeTab, setActiveTab] = useState('active');
  
  // Filter investments based on active tab
  const filteredInvestments = investments.filter(investment => {
    if (!investment.loan) return false;
    
    if (activeTab === 'active') {
      return ['pending', 'approved', 'funded'].includes(investment.loan.status);
    } else if (activeTab === 'completed') {
      return investment.loan.status === 'completed';
    } else if (activeTab === 'defaulted') {
      return investment.loan.status === 'defaulted';
    }
    return true;
  });
  
  // Calculate ROI
  const calculateROI = (investment) => {
    if (!investment.loan) return 0;
    
    const principal = investment.amount;
    const rate = investment.loan.interestRate / 100;
    const term = investment.loan.term / 12; // Convert months to years
    
    // Simple interest calculation
    const interest = principal * rate * term;
    const roi = (interest / principal) * 100;
    
    return roi.toFixed(2);
  };
  
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden mt-8">
      <div className="px-4 py-5 sm:px-6 border-b">
        <h2 className="text-xl font-medium text-gray-900">Your Investments</h2>
        <p className="mt-1 text-sm text-gray-500">
          Track the performance of your investment portfolio
        </p>
      </div>
      
      <div className="border-b border-gray-200">
        <nav className="flex -mb-px">
          <button
            onClick={() => setActiveTab('active')}
            className={`${
              activeTab === 'active'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm`}
          >
            Active Investments
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`${
              activeTab === 'completed'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm`}
          >
            Completed
          </button>
          <button
            onClick={() => setActiveTab('defaulted')}
            className={`${
              activeTab === 'defaulted'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm`}
          >
            Defaulted
          </button>
        </nav>
      </div>
      
      <div className="overflow-x-auto">
        {filteredInvestments.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No investments found in this category</p>
            <Link 
              to="/marketplace" 
              className="mt-4 inline-block px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Browse Loan Marketplace
            </Link>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Loan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Investment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Term
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Est. ROI
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInvestments.map((investment, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {investment.loan?.id?.substring(0, 8)}...
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${investment.amount?.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {investment.date?.toDate().toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {investment.loan?.term} months
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {calculateROI(investment)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span 
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        investment.loan?.status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : investment.loan?.status === 'defaulted'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {investment.loan?.status.charAt(0).toUpperCase() + investment.loan?.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link
                      to={`/loan/${investment.loanId}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
