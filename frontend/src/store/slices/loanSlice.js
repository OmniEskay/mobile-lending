import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { loanAPI } from '../../services/api';

export const fetchLoans = createAsyncThunk(
  'loans/fetchLoans',
  async (_, { rejectWithValue }) => {
    try {
      const response = await loanAPI.getLoans();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch loans');
    }
  }
);

export const createLoan = createAsyncThunk(
  'loans/createLoan',
  async (loanData, { rejectWithValue }) => {
    try {
      const response = await loanAPI.createLoan(loanData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to create loan');
    }
  }
);

export const fetchLoanById = createAsyncThunk(
  'loans/fetchLoanById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await loanAPI.getLoanById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch loan details');
    }
  }
);

const initialState = {
  loans: [],
  selectedLoan: null,
  loading: false,
  error: null,
};

const loanSlice = createSlice({
  name: 'loans',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedLoan: (state) => {
      state.selectedLoan = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch loans
      .addCase(fetchLoans.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLoans.fulfilled, (state, action) => {
        state.loading = false;
        state.loans = action.payload;
      })
      .addCase(fetchLoans.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create loan
      .addCase(createLoan.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createLoan.fulfilled, (state, action) => {
        state.loading = false;
        state.loans.push(action.payload);
      })
      .addCase(createLoan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch loan by ID
      .addCase(fetchLoanById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLoanById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedLoan = action.payload;
      })
      .addCase(fetchLoanById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSelectedLoan } = loanSlice.actions;
export default loanSlice.reducer; 