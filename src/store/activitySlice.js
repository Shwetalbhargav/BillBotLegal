// src/store/activitySlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { activityApi } from '../services/api';

const initialState = {
  items: [],
  loading: false,
  error: null,
};

// GET /api/activities
export const fetchActivities = createAsyncThunk(
  'activity/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await activityApi.list(params);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || 'Failed to load activities'
      );
    }
  }
);

// POST /api/activities
export const createActivityThunk = createAsyncThunk(
  'activity/create',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await activityApi.create(payload);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || 'Failed to create activity'
      );
    }
  }
);

const activitySlice = createSlice({
  name: 'activity',
  initialState,
  reducers: {
    clearActivityError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // list
      .addCase(fetchActivities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActivities.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload || [];
      })
      .addCase(fetchActivities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // create
      .addCase(createActivityThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createActivityThunk.fulfilled, (state, action) => {
        state.loading = false;
        // newest first (optional)
        state.items.unshift(action.payload);
      })
      .addCase(createActivityThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearActivityError } = activitySlice.actions;
export default activitySlice.reducer;
