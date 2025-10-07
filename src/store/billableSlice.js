// src/store/billableSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getBillables, updateBillable, deleteBillable, addBillable } from '@/services/api';

// Thunks
export const fetchBillables = createAsyncThunk('billables/fetch', async () => {
  const { data } = await getBillables();
  return data;
});

export const createBillable = createAsyncThunk('billables/create', async (billable) => {
  const { data } = await addBillable(billable);
  return data;
});

export const editBillable = createAsyncThunk('billables/update', async ({ id, billable }) => {
  const { data } = await updateBillable(id, billable);
  return data;
});

export const removeBillable = createAsyncThunk('billables/delete', async (id) => {
  await deleteBillable(id);
  return id;
});

// Slice
const billableSlice = createSlice({
  name: 'billables',
  initialState: { list: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchBillables.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBillables.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload || [];
      })
      .addCase(fetchBillables.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error?.message || 'Failed to fetch billables';
      })

      // Create
      .addCase(createBillable.fulfilled, (state, action) => {
        state.list.push(action.payload);
      })
      .addCase(createBillable.rejected, (state, action) => {
        state.error = action.error?.message || 'Failed to create billable';
      })

      // Update
      .addCase(editBillable.fulfilled, (state, action) => {
        const idx = state.list.findIndex((b) => b._id === action.payload._id);
        if (idx !== -1) state.list[idx] = action.payload;
      })
      .addCase(editBillable.rejected, (state, action) => {
        state.error = action.error?.message || 'Failed to update billable';
      })

      // Delete
      .addCase(removeBillable.fulfilled, (state, action) => {
        state.list = state.list.filter((b) => b._id !== action.payload);
      })
      .addCase(removeBillable.rejected, (state, action) => {
        state.error = action.error?.message || 'Failed to delete billable';
      });
  },
});

export default billableSlice.reducer;
