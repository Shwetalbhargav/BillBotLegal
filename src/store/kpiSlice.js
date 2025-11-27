import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getKpiSummaryApi, getKpiTrendApi } from '@/services/api';

const initialState = {
  summary: null,
  summaryLoading: false,
  summaryError: null,

  trend: [],
  trendLoading: false,
  trendError: null,
};

// GET /api/kpi/summary
export const fetchKpiSummary = createAsyncThunk(
  'kpi/fetchSummary',
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await getKpiSummaryApi(params);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Failed to load KPI summary'
      );
    }
  }
);

// GET /api/kpi/trend
export const fetchKpiTrend = createAsyncThunk(
  'kpi/fetchTrend',
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await getKpiTrendApi(params);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Failed to load KPI trend'
      );
    }
  }
);

const kpiSlice = createSlice({
  name: 'kpi',
  initialState,
  reducers: {
    clearKpiErrors(state) {
      state.summaryError = null;
      state.trendError = null;
    },
  },
  extraReducers: (builder) => {
    // ---- SUMMARY ----
    builder
      .addCase(fetchKpiSummary.pending, (state) => {
        state.summaryLoading = true;
        state.summaryError = null;
      })
      .addCase(fetchKpiSummary.fulfilled, (state, action) => {
        state.summaryLoading = false;
        state.summary = action.payload || null;
      })
      .addCase(fetchKpiSummary.rejected, (state, action) => {
        state.summaryLoading = false;
        state.summaryError = action.payload || action.error?.message || null;
      });

    // ---- TREND ----
    builder
      .addCase(fetchKpiTrend.pending, (state) => {
        state.trendLoading = true;
        state.trendError = null;
      })
      .addCase(fetchKpiTrend.fulfilled, (state, action) => {
        state.trendLoading = false;
        state.trend = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchKpiTrend.rejected, (state, action) => {
        state.trendLoading = false;
        state.trendError = action.payload || action.error?.message || null;
      });
  },
});

export const { clearKpiErrors } = kpiSlice.actions;
export default kpiSlice.reducer;
