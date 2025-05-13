// API Configuration
export const API_BASE_URL = 'http://localhost:3000/api';

// Authentication
export const MIN_PASSWORD_LENGTH = 8;
export const TOKEN_EXPIRY_DAYS = 7;

// Loan Configuration
export const LOAN_TYPES = {
  PERSONAL: 'personal',
  BUSINESS: 'business',
  EDUCATION: 'education',
};

export const LOAN_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  DISBURSED: 'disbursed',
  COMPLETED: 'completed',
  DEFAULTED: 'defaulted',
};

export const LOAN_TERM_UNITS = {
  DAYS: 'days',
  WEEKS: 'weeks',
  MONTHS: 'months',
  YEARS: 'years',
};

// Payment Configuration
export const PAYMENT_METHODS = {
  BANK_TRANSFER: 'bank_transfer',
  CARD: 'card',
  MOBILE_MONEY: 'mobile_money',
};

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
};

// UI Configuration
export const THEME_COLORS = {
  primary: '#1976D2',
  secondary: '#424242',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FFC107',
  info: '#2196F3',
  background: '#FFFFFF',
  surface: '#FFFFFF',
  text: '#000000',
  disabled: '#9E9E9E',
};

export const SCREEN_PADDING = 16;
export const BORDER_RADIUS = 8;

// Validation
export const PHONE_REGEX = /^\+?[1-9]\d{1,14}$/;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  SESSION_EXPIRED: 'Your session has expired. Please login again.',
  INVALID_CREDENTIALS: 'Invalid email or password.',
  REQUIRED_FIELD: 'This field is required.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  INVALID_PHONE: 'Please enter a valid phone number.',
  PASSWORD_TOO_SHORT: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
  PASSWORDS_NOT_MATCH: 'Passwords do not match.',
}; 