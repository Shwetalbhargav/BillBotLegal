// src/store/clioSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getClioStatus,
  getClioConnectUrl,
  syncClioBillables,
  syncClioInvoices,
} from '../services/api';

const initialState = {
  status: null,          // { connected, reason, clioUser, raw }
  loadingStatus: false,
  loadingSync: false,
  error: null,
  lastSyncResult: null,  // { billablesMessage?, invoicesMessage? }
};

// GET /api/clio/status
// This also refreshes the token server-side if it's expired.
export const fetchClioStatus = createAsyncThunk(
  'clio/fetchStatus',
  async (_, { rejectWithValue }) => {
    try {
      const res = await getClioStatus();
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || 'Failed to fetch Clio status'
      );
    }
  }
);

// POST /api/clio-sync/sync-billables
export const syncClioBillablesThunk = createAsyncThunk(
  'clio/syncBillables',
  async ({ userId } = {}, { rejectWithValue }) => {
    try {
      const res = await syncClioBillables(userId);
      return res.data; // { message: "✅ Synced ..." }
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          'Failed to sync Clio billables'
      );
    }
  }
);

// POST /api/clio-sync/sync-invoices
export const syncClioInvoicesThunk = createAsyncThunk(
  'clio/syncInvoices',
  async ({ userId } = {}, { rejectWithValue }) => {
    try {
      const res = await syncClioInvoices(userId);
      return res.data; // { message: "✅ Synced ..." }
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          'Failed to sync Clio invoices'
      );
    }
  }
);

const clioSlice = createSlice({
  name: 'clio',
  initialState,
  reducers: {
    clearClioError(state) {
      state.error = null;
    },
    clearClioSyncResult(state) {
      state.lastSyncResult = null;
    },
    // Utility if you want to trigger connect from UI
    openClioConnectPage() {
      const url = getClioConnectUrl();
      window.location.href = url;
    },
  },
  extraReducers: (builder) => {
    // STATUS
    builder
      .addCase(fetchClioStatus.pending, (state) => {
        state.loadingStatus = true;
        state.error = null;
      })
      .addCase(fetchClioStatus.fulfilled, (state, action) => {
        state.loadingStatus = false;
        state.status = action.payload;
      })
      .addCase(fetchClioStatus.rejected, (state, action) => {
        state.loadingStatus = false;
        state.error = action.payload;
      });

    // SYNC BILLABLES
    builder
      .addCase(syncClioBillablesThunk.pending, (state) => {
        state.loadingSync = true;
        state.error = null;
      })
      .addCase(syncClioBillablesThunk.fulfilled, (state, action) => {
        state.loadingSync = false;
        state.lastSyncResult = {
          ...(state.lastSyncResult || {}),
          billablesMessage: action.payload?.message || 'Billables sync completed',
        };
      })
      .addCase(syncClioBillablesThunk.rejected, (state, action) => {
        state.loadingSync = false;
        state.error = action.payload;
      });

    // SYNC INVOICES
    builder
      .addCase(syncClioInvoicesThunk.pending, (state) => {
        state.loadingSync = true;
        state.error = null;
      })
      .addCase(syncClioInvoicesThunk.fulfilled, (state, action) => {
        state.loadingSync = false;
        state.lastSyncResult = {
          ...(state.lastSyncResult || {}),
          invoicesMessage: action.payload?.message || 'Invoices sync completed',
        };
      })
      .addCase(syncClioInvoicesThunk.rejected, (state, action) => {
        state.loadingSync = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearClioError,
  clearClioSyncResult,
  openClioConnectPage,
} = clioSlice.actions;

export default clioSlice.reducer;
