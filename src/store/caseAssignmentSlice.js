// src/store/caseAssignmentSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { caseAssignments } from '../services/api';

const initialState = {
  items: [],
  loading: false,
  error: null,
};

// LIST
export const fetchCaseAssignments = createAsyncThunk(
  'caseAssignments/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await caseAssignments.list(params);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || 'Failed to load case assignments'
      );
    }
  }
);

// CREATE
export const createCaseAssignmentThunk = createAsyncThunk(
  'caseAssignments/create',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await caseAssignments.create(payload);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || 'Failed to create case assignment'
      );
    }
  }
);

// UPDATE
export const updateCaseAssignmentThunk = createAsyncThunk(
  'caseAssignments/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await caseAssignments.update(id, data);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || 'Failed to update case assignment'
      );
    }
  }
);

// DELETE
export const deleteCaseAssignmentThunk = createAsyncThunk(
  'caseAssignments/delete',
  async (id, { rejectWithValue }) => {
    try {
      await caseAssignments.remove(id);
      return id;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || 'Failed to delete case assignment'
      );
    }
  }
);

const caseAssignmentSlice = createSlice({
  name: 'caseAssignments',
  initialState,
  reducers: {
    clearCaseAssignmentError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // list
    builder
      .addCase(fetchCaseAssignments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCaseAssignments.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload || [];
      })
      .addCase(fetchCaseAssignments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // create
    builder
      .addCase(createCaseAssignmentThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCaseAssignmentThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload);
      })
      .addCase(createCaseAssignmentThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // update
    builder.addCase(updateCaseAssignmentThunk.fulfilled, (state, action) => {
      const idx = state.items.findIndex((a) => a.id === action.payload.id);
      if (idx !== -1) state.items[idx] = action.payload;
    });

    // delete
    builder.addCase(deleteCaseAssignmentThunk.fulfilled, (state, action) => {
      state.items = state.items.filter((a) => a.id !== action.payload);
    });
  },
});

export const { clearCaseAssignmentError } = caseAssignmentSlice.actions;
export default caseAssignmentSlice.reducer;
