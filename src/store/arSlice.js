// src/store/arSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { arApi } from '../services/api';

const initialState = {
  aging: null,
  agingByClient: null,
  loading: false,
  error: null,
};

// A/R aging totals
export const fetchArAging = createAsyncThunk(
  'ar/fetchAging',
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await arApi.get('/aging', params);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || 'Failed to load A/R aging'
      );
    }
  }
);

// A/R aging grouped by client
export const fetchArAgingByClient = createAsyncThunk(
  'ar/fetchAgingByClient',
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await arApi.get('/aging/by-client', params);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || 'Failed to load A/R aging by client'
      );
    }
  }
);

const arSlice = createSlice({
  name: 'ar',
  initialState,
  reducers: {
    clearArError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // shared pending handlers
    builder
      .addCase(fetchArAging.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchArAgingByClient.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      // totals
      .addCase(fetchArAging.fulfilled, (state, action) => {
        state.loading = false;
        state.aging = action.payload;
      })
      .addCase(fetchArAging.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // by-client
      .addCase(fetchArAgingByClient.fulfilled, (state, action) => {
        state.loading = false;
        state.agingByClient = action.payload;
      })
      .addCase(fetchArAgingByClient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearArError } = arSlice.actions;
export default arSlice.reducer;
