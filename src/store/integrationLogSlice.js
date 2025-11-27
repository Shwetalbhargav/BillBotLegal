import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  listIntegrationLogsApi,
  getIntegrationLogByIdApi,
  listLogsByBillableApi,
  listLogsByInvoiceApi,
  getIntegrationLogStatsApi,
  deleteIntegrationLogApi,
  purgeIntegrationLogsApi,
} from "@/services/api";

// ---------- Thunks ----------

// List logs with filters
export const fetchIntegrationLogs = createAsyncThunk(
  "integrationLogs/fetchList",
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await listIntegrationLogsApi(params);
      const items = res.data?.data ?? res.data;
      const meta = res.data?.meta ?? null;
      return { items, meta, params };
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || err?.message || "Failed to fetch integration logs"
      );
    }
  }
);

// Get single log
export const fetchIntegrationLogById = createAsyncThunk(
  "integrationLogs/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await getIntegrationLogByIdApi(id);
      const log = res.data?.data ?? res.data;
      return log;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || err?.message || "Failed to fetch integration log"
      );
    }
  }
);

// Logs by billable
export const fetchLogsByBillable = createAsyncThunk(
  "integrationLogs/fetchByBillable",
  async (billableId, { rejectWithValue }) => {
    try {
      const res = await listLogsByBillableApi(billableId);
      const items = res.data?.data ?? res.data;
      return { billableId, items };
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || err?.message || "Failed to fetch logs for billable"
      );
    }
  }
);

// Logs by invoice
export const fetchLogsByInvoice = createAsyncThunk(
  "integrationLogs/fetchByInvoice",
  async (invoiceId, { rejectWithValue }) => {
    try {
      const res = await listLogsByInvoiceApi(invoiceId);
      const items = res.data?.data ?? res.data;
      return { invoiceId, items };
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || err?.message || "Failed to fetch logs for invoice"
      );
    }
  }
);

// Stats (groupBy platform/status)
export const fetchIntegrationLogStats = createAsyncThunk(
  "integrationLogs/fetchStats",
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await getIntegrationLogStatsApi(params);
      const rows = res.data?.data ?? res.data;
      return { params, rows };
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || err?.message || "Failed to fetch integration log stats"
      );
    }
  }
);

// Delete single log
export const deleteIntegrationLog = createAsyncThunk(
  "integrationLogs/delete",
  async (id, { rejectWithValue }) => {
    try {
      await deleteIntegrationLogApi(id);
      return id;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || err?.message || "Failed to delete integration log"
      );
    }
  }
);

// Purge logs by filter
export const purgeIntegrationLogs = createAsyncThunk(
  "integrationLogs/purge",
  async (payload = {}, { rejectWithValue }) => {
    try {
      const res = await purgeIntegrationLogsApi(payload);
      // { ok: true, deletedCount }
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || err?.message || "Failed to purge integration logs"
      );
    }
  }
);

// ---------- Slice ----------

const initialState = {
  list: [],
  meta: null,
  filters: {},

  loading: false,
  error: null,

  selectedLog: null,
  selectedLoading: false,
  selectedError: null,

  byBillable: {}, // { [billableId]: [...] }
  byInvoice: {},  // { [invoiceId]: [...] }

  stats: [],
  statsParams: {},
  statsLoading: false,
  statsError: null,

  deleting: false,
  deleteError: null,

  purging: false,
  purgeError: null,
  purgeResult: null,
};

const integrationLogSlice = createSlice({
  name: "integrationLogs",
  initialState,
  reducers: {
    clearIntegrationLogError(state) {
      state.error = null;
      state.selectedError = null;
      state.statsError = null;
      state.deleteError = null;
      state.purgeError = null;
    },
    setIntegrationLogFilters(state, action) {
      state.filters = action.payload || {};
    },
    setSelectedIntegrationLog(state, action) {
      state.selectedLog = action.payload || null;
    },
  },
  extraReducers: (builder) => {
    // ---- LIST ----
    builder
      .addCase(fetchIntegrationLogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchIntegrationLogs.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.items || [];
        state.meta = action.payload.meta || null;
        state.filters = action.payload.params || {};
      })
      .addCase(fetchIntegrationLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error?.message || null;
      });

    // ---- GET BY ID ----
    builder
      .addCase(fetchIntegrationLogById.pending, (state) => {
        state.selectedLoading = true;
        state.selectedError = null;
      })
      .addCase(fetchIntegrationLogById.fulfilled, (state, action) => {
        state.selectedLoading = false;
        state.selectedLog = action.payload || null;
      })
      .addCase(fetchIntegrationLogById.rejected, (state, action) => {
        state.selectedLoading = false;
        state.selectedError = action.payload || action.error?.message || null;
      });

    // ---- BY BILLABLE ----
    builder
      .addCase(fetchLogsByBillable.pending, (state) => {
        // optional: could add separate flag per billable if needed
      })
      .addCase(fetchLogsByBillable.fulfilled, (state, action) => {
        const { billableId, items } = action.payload || {};
        if (!billableId) return;
        state.byBillable[billableId] = items || [];
      })
      .addCase(fetchLogsByBillable.rejected, (state, action) => {
        state.error = action.payload || action.error?.message || null;
      });

    // ---- BY INVOICE ----
    builder
      .addCase(fetchLogsByInvoice.pending, (state) => {})
      .addCase(fetchLogsByInvoice.fulfilled, (state, action) => {
        const { invoiceId, items } = action.payload || {};
        if (!invoiceId) return;
        state.byInvoice[invoiceId] = items || [];
      })
      .addCase(fetchLogsByInvoice.rejected, (state, action) => {
        state.error = action.payload || action.error?.message || null;
      });

    // ---- STATS ----
    builder
      .addCase(fetchIntegrationLogStats.pending, (state) => {
        state.statsLoading = true;
        state.statsError = null;
      })
      .addCase(fetchIntegrationLogStats.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.stats = action.payload.rows || [];
        state.statsParams = action.payload.params || {};
      })
      .addCase(fetchIntegrationLogStats.rejected, (state, action) => {
        state.statsLoading = false;
        state.statsError = action.payload || action.error?.message || null;
      });

    // ---- DELETE ----
    builder
      .addCase(deleteIntegrationLog.pending, (state) => {
        state.deleting = true;
        state.deleteError = null;
      })
      .addCase(deleteIntegrationLog.fulfilled, (state, action) => {
        state.deleting = false;
        const id = action.payload;
        state.list = state.list.filter(
          (log) => String(log._id || log.id) !== String(id)
        );
      })
      .addCase(deleteIntegrationLog.rejected, (state, action) => {
        state.deleting = false;
        state.deleteError = action.payload || action.error?.message || null;
      });

    // ---- PURGE ----
    builder
      .addCase(purgeIntegrationLogs.pending, (state) => {
        state.purging = true;
        state.purgeError = null;
        state.purgeResult = null;
      })
      .addCase(purgeIntegrationLogs.fulfilled, (state, action) => {
        state.purging = false;
        state.purgeResult = action.payload || null;
        // optional: you can also clear list or refetch via UI after purge
      })
      .addCase(purgeIntegrationLogs.rejected, (state, action) => {
        state.purging = false;
        state.purgeError = action.payload || action.error?.message || null;
      });
  },
});

export const {
  clearIntegrationLogError,
  setIntegrationLogFilters,
  setSelectedIntegrationLog,
} = integrationLogSlice.actions;

export default integrationLogSlice.reducer;
