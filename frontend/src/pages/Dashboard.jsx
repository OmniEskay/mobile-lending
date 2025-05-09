import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LoanModel } from '../models/LoanModel';
import { UserModel } from '../models/UserModel';
import BorrowerDashboard from '../components/BorrowerDashboard';
import InvestorDashboard from '../components/InvestorDashboard';
import AdminDashboard from '../components/AdminDashboard';
import LoanCalculator from '../components/LoanCalculator';

export default function Dashboard() {
  const { currentUser, userProfile } = useAuth();
  const [activeLoans, setActiveLoans] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBorrowed: 0,
    totalInvested: 0,
    totalRepaid: 0,
    activeInvestments: 0,
    pendingLoans: 0,
    totalReturns: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser || !userProfile) return;
      
      setIsLoading(true);
      try {
        // Fetch loans data
        const loans = await LoanModel.getLoansByBorrowerId(currentUser.uid);
        setActiveLoans(loans);
        
        // Fetch investments data
        const userInvestments = await UserModel.getUserInvestments(currentUser.uid);
        setInvestments(userInvestments);
        
        // Calculate statistics
        calculateStats(loans, userInvestments);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [currentUser, userProfile]);
  
  const calculateStats = (loans, investments) => {
    // Calculate borrower stats
    const totalBorrowed = loans.reduce((sum, loan) => 
      sum + (loan.fundedAmount || 0), 0);
      
    const totalRepaid = loans.reduce((sum, loan) => 
      sum + (loan.repaidAmount || 0), 0);
      
    const pendingLoans = loans.filter(loan => 
      loan.status === "pending" || loan.status === "approved").length;
    
    // Calculate investor stats
    const totalInvested = investments.reduce((sum, inv) => 
      sum + (inv.amount || 0), 0);
      
    const activeInvestments = investments.filter(inv => 
      inv.loan && inv.loan.status !== "completed" && inv.loan.status !== "defaulted").length;
      
    // Calculate estimated returns (simplified)
    const totalReturns = investments.reduce((sum, inv) => {
      if (!inv.loan) return sum;
      
      const principal = inv.amount || 0;
      const rate = inv.loan.interestRate / 100;
      const term = inv.loan.term / 12; // Convert months to years
      
      // Simple interest calculation for demonstration
      const interest = principal * rate * term;
      return sum + interest;
    }, 0);
    
    setStats({
      totalBorrowed,
      totalInvested,
      totalRepaid,
      activeInvestments,
      pendingLoans,
      totalReturns
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <div className="stats-overview grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {userProfile.role === 'borrower' && (
          <>
            <div className="stat-card bg-white p-4 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm uppercase">Total Borrowed</h3>
              <p className="text-2xl font-bold">${stats.totalBorrowed.toFixed(2)}</p>
            </div>
            <div className="stat-card bg-white p-4 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm uppercase">Total Repaid</h3>
              <p className="text-2xl font-bold">${stats.totalRepaid.toFixed(2)}</p>
            </div>
            <div className="stat-card bg-white p-4 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm uppercase">Pending Loans</h3>
              <p className="text-2xl font-bold">{stats.pendingLoans}</p>
            </div>
          </>
        )}
        
        {(userProfile.role === 'investor' || userProfile.role === 'both') && (
          <>
            <div className="stat-card bg-white p-4 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm uppercase">Total Invested</h3>
              <p className="text-2xl font-bold">${stats.totalInvested.toFixed(2)}</p>
            </div>
            <div className="stat-card bg-white p-4 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm uppercase">Active Investments</h3>
              <p className="text-2xl font-bold">{stats.activeInvestments}</p>
            </div>
            <div className="stat-card bg-white p-4 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm uppercase">Est. Returns</h3>
              <p className="text-2xl font-bold">${stats.totalReturns.toFixed(2)}</p>
            </div>
          </>
        )}
      </div>
      
      {userProfile.role === 'admin' && <AdminDashboard />}
      
      {(userProfile.role === 'borrower' || userProfile.role === 'both') && (
        <BorrowerDashboard loans={activeLoans} />
      )}
      
      {(userProfile.role === 'investor' || userProfile.role === 'both') && (
        <InvestorDashboard investments={investments} />
      )}
      
      <div className="mt-8">
        <LoanCalculator />
      </div>
    </div>
  );
}
