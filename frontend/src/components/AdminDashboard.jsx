import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { LoanModel } from '../models/LoanModel';
import { UserModel } from '../models/UserModel';
import { NotificationService } from '../utils/notificationService';

export default function AdminDashboard() {
  const [pendingLoans, setPendingLoans] = useState([]);
  const [unverifiedUsers, setUnverifiedUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      setIsLoading(true);
      try {
        // Fetch pending loan applications
        const loansQuery = query(
          collection(db, "loans"),
          where("status", "==", "pending")
        );

        const loansSnapshot = await getDocs(loansQuery);
        const loans = [];

        loansSnapshot.forEach((doc) => {
          loans.push({ id: doc.id, ...doc.data() });
        });

        setPendingLoans(loans);

        // Fetch unverified users
        const usersQuery = query(
          collection(db, "users"),
          where("isVerified", "==", false)
        );

        const usersSnapshot = await getDocs(usersQuery);
        const users = [];

        usersSnapshot.forEach((doc) => {
          users.push({ id: doc.id, ...doc.data() });
        });

        setUnverifiedUsers(users);
      } catch (error) {
        console.error("Error fetching admin data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  const handleLoanApproval = async (loanId) => {
    try {
      await LoanModel.approveLoan(loanId);
      const loan = await LoanModel.getLoanById(loanId);
      await NotificationService.sendLoanApprovalNotification(
        loan.borrowerId,
        loanId
      );
      setPendingLoans(prevLoans =>
        prevLoans.filter(loan => loan.id !== loanId)
      );
    } catch (error) {
      console.error("Error approving loan:", error);
      alert("Failed to approve loan. Please try again.");
    }
  };

  const handleLoanRejection = async (loanId) => {
    const reason = prompt("Please provide a reason for rejection:");
    if (!reason) return;

    try {
      await LoanModel.rejectLoan(loanId, reason);
      setPendingLoans(prevLoans =>
        prevLoans.filter(loan => loan.id !== loanId)
      );
    } catch (error) {
      console.error("Error rejecting loan:", error);
      alert("Failed to reject loan. Please try again.");
    }
  };

  const handleUserVerification = async (userId) => {
    try {
      await UserModel.verifyUser(userId);
      setUnverifiedUsers(prevUsers =>
        prevUsers.filter(user => user.id !== userId)
      );
    } catch (error) {
      console.error("Error verifying user:", error);
      alert("Failed to verify user. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b">
          <h2 className="text-xl font-medium text-gray-900">Admin Dashboard</h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage loan applications and user verifications
          </p>
        </div>

        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Pending Loan Applications</h3>

          {pendingLoans.length === 0 ? (
            <p className="text-gray-500">No pending loan applications</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Borrower</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purpose</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Term</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pendingLoans.map((loan) => (
                    <tr key={loan.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{loan.borrowerName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${loan.amount?.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{loan.purpose}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{loan.term} months</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{loan.createdAt?.toDate().toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleLoanApproval(loan.id)}
                          className="text-green-600 hover:text-green-900 mr-4"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleLoanRejection(loan.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="p-6 border-t">
          <h3 className="text-lg font-medium text-gray-900 mb-4">User Verification Requests</h3>

          {unverifiedUsers.length === 0 ? (
            <p className="text-gray-500">No users waiting for verification</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {unverifiedUsers.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.fullName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.role || 'Borrower'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleUserVerification(user.id)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Verify
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
