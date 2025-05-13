import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('token');
      // Navigate to login screen (implement navigation ref)
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  verifyEmail: (token) => api.get(`/auth/verify-email/${token}`),
  getCurrentUser: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
  requestPasswordReset: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
};

export const loanAPI = {
  applyForLoan: (loanData) => api.post('/loans/apply', loanData),
  getLoanDetails: (loanId) => api.get(`/loans/${loanId}`),
  processLoanApplication: (loanId, data) => api.put(`/loans/${loanId}/process`, data),
  disburseLoan: (loanId) => api.post(`/loans/${loanId}/disburse`),
  processRepayment: (loanId, data) => api.post(`/loans/${loanId}/repay`, data),
  getBorrowerLoans: () => api.get('/loans/borrower/me'),
  getLenderLoans: () => api.get('/loans/lender/me'),
  getAvailableLoans: () => api.get('/loans/available'),
};

export default api; 