import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  generateKpiSnapshotsApi,
  listKpiSnapshotsApi,
  getKpiSnapshotByIdApi,
} from '@/services/api';

const initialState = {
  items: [],
  loading: false,
  error: null,

  generating: false,
  generateError: null,

  selectedSnapshot: null,
  selectedLoading: false,
  selectedError: null,
};

// LIST (GET /api/kpi-snapshots)
export const fetchKpiSnapshots = createAsyncThunk(
  'kpiSnapshots/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await listKpiSnapshotsApi(params);
      // controller returns array of snapshots
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Failed to load KPI snapshots'
      );
    }
  }
);

// GET ONE (GET /api/kpi-snapshots/:id)
export const fetchKpiSnapshotById = createAsyncThunk(
  'kpiSnapshots/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const res = await getKpiSnapshotByIdApi(id);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Failed to load KPI snapshot'
      );
    }
  }
);

// GENERATE (POST /api/kpi-snapshots/generate)
export const generateKpiSnapshotsThunk = createAsyncThunk(
  'kpiSnapshots/generate',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await generateKpiSnapshotsApi(payload);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Failed to generate KPI snapshots'
      );
    }
  }
);

const kpiSnapshotSlice = createSlice({
  name: 'kpiSnapshots',
  initialState,
  reducers: {
    clearKpiSnapshotError(state) {
      state.error = null;
      state.generateError = null;
      state.selectedError = null;
    },
  },
  extraReducers: (builder) => {
    // ---- LIST ----
    builder
      .addCase(fetchKpiSnapshots.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchKpiSnapshots.fulfilled, (state, action) => {
        state.loading = false;
        state.items = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchKpiSnapshots.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error?.message || null;
      });

    // ---- GET BY ID ----
    builder
      .addCase(fetchKpiSnapshotById.pending, (state) => {
        state.selectedLoading = true;
        state.selectedError = null;
      })
      .addCase(fetchKpiSnapshotById.fulfilled, (state, action) => {
        state.selectedLoading = false;
        const snap = action.payload || null;
        state.selectedSnapshot = snap;

        if (!snap) return;
        const id = snap._id || snap.id;
        const idx = state.items.findIndex(
          (k) => String(k._id || k.id) === String(id)
        );
        if (idx !== -1) {
          state.items[idx] = snap;
        }
      })
      .addCase(fetchKpiSnapshotById.rejected, (state, action) => {
        state.selectedLoading = false;
        state.selectedError = action.payload || action.error?.message || null;
      });

    // ---- GENERATE ----
    builder
      .addCase(generateKpiSnapshotsThunk.pending, (state) => {
        state.generating = true;
        state.generateError = null;
      })
      .addCase(generateKpiSnapshotsThunk.fulfilled, (state, action) => {
        state.generating = false;
        const result = action.payload;

        // Depending on controller, this might be a single snapshot or an array.
        if (!result) return;

        const snaps = Array.isArray(result) ? result : [result];

        // Prepend new snapshots and keep the rest
        state.items = [...snaps, ...state.items];
        // You can pick one as the "selected" snapshot if desired:
        state.selectedSnapshot = snaps[0] || state.selectedSnapshot;
      })
      .addCase(generateKpiSnapshotsThunk.rejected, (state, action) => {
        state.generating = false;
        state.generateError =
          action.payload || action.error?.message || null;
      });
  },
});

export const { clearKpiSnapshotError } = kpiSnapshotSlice.actions;
export default kpiSnapshotSlice.reducer;
