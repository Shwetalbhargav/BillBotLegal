import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  getZohoStatus,
  getZohoConnectUrl,
  linkZohoWorkDrive,
  syncZohoCases,
  syncZohoClients,
} from '../services/api';

const initialState = {
  status: null,
  loadingStatus: false,
  loadingSync: false,
  error: null,
  lastSyncResult: null,
};

export const fetchZohoStatus = createAsyncThunk(
  'zoho/fetchStatus',
  async (_, { rejectWithValue }) => {
    try {
      const res = await getZohoStatus();
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || 'Failed to fetch Zoho status'
      );
    }
  }
);

export const syncZohoClientsThunk = createAsyncThunk(
  'zoho/syncClients',
  async (payload = {}, { rejectWithValue }) => {
    try {
      const res = await syncZohoClients(payload);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || 'Failed to sync Zoho clients'
      );
    }
  }
);

export const syncZohoCasesThunk = createAsyncThunk(
  'zoho/syncCases',
  async (payload = {}, { rejectWithValue }) => {
    try {
      const res = await syncZohoCases(payload);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || 'Failed to sync Zoho matters'
      );
    }
  }
);

export const linkZohoWorkDriveThunk = createAsyncThunk(
  'zoho/linkWorkDrive',
  async (payload = {}, { rejectWithValue }) => {
    try {
      const res = await linkZohoWorkDrive(payload);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || 'Failed to link Zoho WorkDrive'
      );
    }
  }
);

const zohoSlice = createSlice({
  name: 'zoho',
  initialState,
  reducers: {
    clearZohoError(state) {
      state.error = null;
    },
    clearZohoSyncResult(state) {
      state.lastSyncResult = null;
    },
    openZohoConnectPage() {
      window.location.href = getZohoConnectUrl();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchZohoStatus.pending, (state) => {
        state.loadingStatus = true;
        state.error = null;
      })
      .addCase(fetchZohoStatus.fulfilled, (state, action) => {
        state.loadingStatus = false;
        state.status = action.payload;
      })
      .addCase(fetchZohoStatus.rejected, (state, action) => {
        state.loadingStatus = false;
        state.error = action.payload;
      })
      .addCase(syncZohoClientsThunk.pending, (state) => {
        state.loadingSync = true;
        state.error = null;
      })
      .addCase(syncZohoCasesThunk.pending, (state) => {
        state.loadingSync = true;
        state.error = null;
      })
      .addCase(linkZohoWorkDriveThunk.pending, (state) => {
        state.loadingSync = true;
        state.error = null;
      })
      .addCase(syncZohoClientsThunk.fulfilled, (state, action) => {
        state.loadingSync = false;
        state.lastSyncResult = {
          ...(state.lastSyncResult || {}),
          clients: action.payload?.results || [],
        };
      })
      .addCase(syncZohoCasesThunk.fulfilled, (state, action) => {
        state.loadingSync = false;
        state.lastSyncResult = {
          ...(state.lastSyncResult || {}),
          cases: action.payload?.results || [],
        };
      })
      .addCase(linkZohoWorkDriveThunk.fulfilled, (state, action) => {
        state.loadingSync = false;
        state.lastSyncResult = {
          ...(state.lastSyncResult || {}),
          workdrive: action.payload?.data || null,
        };
      })
      .addCase(syncZohoClientsThunk.rejected, (state, action) => {
        state.loadingSync = false;
        state.error = action.payload;
      })
      .addCase(syncZohoCasesThunk.rejected, (state, action) => {
        state.loadingSync = false;
        state.error = action.payload;
      })
      .addCase(linkZohoWorkDriveThunk.rejected, (state, action) => {
        state.loadingSync = false;
        state.error = action.payload;
      });
  },
});

export const { clearZohoError, clearZohoSyncResult, openZohoConnectPage } =
  zohoSlice.actions;

export default zohoSlice.reducer;
