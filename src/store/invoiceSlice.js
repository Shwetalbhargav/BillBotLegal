import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getInvoices, createInvoice } from '@/services/api';

export const fetchInvoices = createAsyncThunk('invoices/fetch', async () => {
  const { data } = await getInvoices();
  return data;
});

export const addInvoice = createAsyncThunk('invoices/create', async (invoice) => {
  const { data } = await createInvoice(invoice);
  return data;
});

// For demo purposes: update & delete can be added when API endpoints exist

const invoiceSlice = createSlice({
  name: 'invoices',
  initialState: { list: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchInvoices.pending, (state) => { state.loading = true; })
      .addCase(fetchInvoices.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchInvoices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(addInvoice.fulfilled, (state, action) => {
        state.list.push(action.payload);
      });
  },
});

export default invoiceSlice.reducer;
