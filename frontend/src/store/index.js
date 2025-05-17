import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import loanReducer from './slices/loanSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    loans: loanReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store; 