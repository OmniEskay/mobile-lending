import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebase';

export class UserModel {
  // Get user by ID
  static async getUserById(userId) {
    try {
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        return { id: userDoc.id, ...userDoc.data() };
      }
      return null;
    } catch (error) {
      console.error("Error getting user:", error);
      throw error;
    }
  }
  
  // Update user profile
  static async updateUserProfile(userId, data) {
    try {
      await updateDoc(doc(db, "users", userId), {
        ...data,
        updatedAt: new Date()
      });
      
      return { success: true };
    } catch (error) {
      console.error("Error updating user profile:", error);
      throw error;
    }
  }
  
  // Update user role
  static async updateUserRole(userId, role) {
    try {
      await updateDoc(doc(db, "users", userId), {
        role,
        updatedAt: new Date()
      });
      
      return { success: true };
    } catch (error) {
      console.error("Error updating user role:", error);
      throw error;
    }
  }
  
  // Update credit score
  static async updateCreditScore(userId, score) {
    try {
      await updateDoc(doc(db, "users", userId), {
        creditScore: score,
        updatedAt: new Date()
      });
      
      return { success: true };
    } catch (error) {
      console.error("Error updating credit score:", error);
      throw error;
    }
  }
  
  // Get user's investments
  static async getUserInvestments(userId) {
    try {
      const userDoc = await getDoc(doc(db, "users", userId));
      if (!userDoc.exists()) return [];
      
      const userData = userDoc.data();
      const investments = userData.investments || [];
      
      // Fetch detailed loan information for each investment
      const detailedInvestments = await Promise.all(
        investments.map(async (investment) => {
          const loanDoc = await getDoc(doc(db, "loans", investment.loanId));
          if (loanDoc.exists()) {
            return {
              ...investment,
              loan: { id: loanDoc.id, ...loanDoc.data() }
            };
          }
          return investment;
        })
      );
      
      return detailedInvestments;
    } catch (error) {
      console.error("Error getting user investments:", error);
      throw error;
    }
  }
  
  // Verify user
  static async verifyUser(userId) {
    try {
      await updateDoc(doc(db, "users", userId), {
        isVerified: true,
        updatedAt: new Date()
      });
      
      return { success: true };
    } catch (error) {
      console.error("Error verifying user:", error);
      throw error;
    }
  }
}
