import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { clearError as clearAuthError } from '../store/slices/authSlice';
import { clearError as clearLoanError } from '../store/slices/loanSlice';

const useApiError = (error, onError) => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (error) {
      // Show error message using your preferred UI component
      if (onError) {
        onError(error);
      }

      // Clear the error after showing it
      const timer = setTimeout(() => {
        dispatch(clearAuthError());
        dispatch(clearLoanError());
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [error, dispatch, onError]);
};

export default useApiError; 