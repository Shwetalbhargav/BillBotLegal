// src/store/revenueSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getRevenueBreakdownApi,
  getMonthlyRevenueApi,
} from '../services/api';

const initialState = {
  breakdown: {
    data: null,
    loading: false,
  },
  monthly: {
    data: null,
    loading: false,
  },
  error: null,
};

// BREAKDOWN (e.g., by client, case type, user, etc.)
export const fetchRevenueBreakdown = createAsyncThunk(
  'revenue/fetchBreakdown',
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await getRevenueBreakdownApi(params);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || 'Failed to load revenue breakdown'
      );
    }
  }
);

// MONTHLY (time-series)
export const fetchMonthlyRevenue = createAsyncThunk(
  'revenue/fetchMonthly',
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await getMonthlyRevenueApi(params);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || 'Failed to load monthly revenue'
      );
    }
  }
);

const revenueSlice = createSlice({
  name: 'revenue',
  initialState,
  reducers: {
    clearRevenueError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // ---- BREAKDOWN ----
    builder
      .addCase(fetchRevenueBreakdown.pending, (state) => {
        state.breakdown.loading = true;
        state.error = null;
      })
      .addCase(fetchRevenueBreakdown.fulfilled, (state, action) => {
        state.breakdown.loading = false;
        state.breakdown.data = action.payload || null;
      })
      .addCase(fetchRevenueBreakdown.rejected, (state, action) => {
        state.breakdown.loading = false;
        state.error = action.payload;
      });

    // ---- MONTHLY ----
    builder
      .addCase(fetchMonthlyRevenue.pending, (state) => {
        state.monthly.loading = true;
        state.error = null;
      })
      .addCase(fetchMonthlyRevenue.fulfilled, (state, action) => {
        state.monthly.loading = false;
        state.monthly.data = action.payload || null;
      })
      .addCase(fetchMonthlyRevenue.rejected, (state, action) => {
        state.monthly.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearRevenueError } = revenueSlice.actions;
export default revenueSlice.reducer;
