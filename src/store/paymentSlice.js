// src/store/paymentSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { payments, reconcilePaymentApi } from '../services/api';

// Backend supports:
// GET  /api/payments?invoiceId=&status=&from=&to=
// POST /api/payments
// POST /api/payments/:id/reconcile
// DELETE /api/payments/:id

const initialState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchPayments = createAsyncThunk(
  'payments/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await payments.list(params);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || 'Failed to load payments'
      );
    }
  }
);

export const createPaymentThunk = createAsyncThunk(
  'payments/create',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await payments.create(payload);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || 'Failed to create payment'
      );
    }
  }
);

export const deletePaymentThunk = createAsyncThunk(
  'payments/delete',
  async (id, { rejectWithValue }) => {
    try {
      await payments.remove(id);
      return id;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || 'Failed to delete payment'
      );
    }
  }
);

export const reconcilePaymentThunk = createAsyncThunk(
  'payments/reconcile',
  async ({ id, data = {} }, { rejectWithValue }) => {
    try {
      const res = await reconcilePaymentApi(id, data);
      return res.data; // expected updated payment
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || 'Failed to reconcile payment'
      );
    }
  }
);

const paymentSlice = createSlice({
  name: 'payments',
  initialState,
  reducers: {
    clearPaymentError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // list
    builder
      .addCase(fetchPayments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPayments.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload || [];
      })
      .addCase(fetchPayments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // create
    builder
      .addCase(createPaymentThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPaymentThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload);
      })
      .addCase(createPaymentThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

      // delete
    builder
      .addCase(deletePaymentThunk.fulfilled, (state, action) => {
        state.items = state.items.filter((p) => p.id !== action.payload);
      });

    // reconcile -> replace updated payment
    builder.addCase(reconcilePaymentThunk.fulfilled, (state, action) => {
      const idx = state.items.findIndex((p) => p.id === action.payload.id);
      if (idx !== -1) state.items[idx] = action.payload;
    });
  },
});

export const { clearPaymentError } = paymentSlice.actions;
export default paymentSlice.reducer;
