import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getBillables, addBillable, updateBillable, deleteBillable } from '@/services/api';

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

const billableSlice = createSlice({
  name: 'billables',
  initialState: { list: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBillables.pending, (state) => { state.loading = true; })
      .addCase(fetchBillables.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchBillables.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(createBillable.fulfilled, (state, action) => { state.list.push(action.payload); })
      .addCase(editBillable.fulfilled, (state, action) => {
        const idx = state.list.findIndex(b => b._id === action.payload._id);
        if (idx !== -1) state.list[idx] = action.payload;
      })
      .addCase(removeBillable.fulfilled, (state, action) => {
        state.list = state.list.filter(b => b._id !== action.payload);
      });
  },
});

export default billableSlice.reducer;
