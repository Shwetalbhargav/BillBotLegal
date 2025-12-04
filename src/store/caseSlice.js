// src/store/caseSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getCases as apiGetCases,
  createCase as apiCreateCase,
  updateCase as apiUpdateCase,
  deleteCase as apiDeleteCase,
  getCaseById as apiGetCaseById,
  transitionCaseStatus as apiTransitionCaseStatus,
  listCaseTimeEntries as apiListCaseTimeEntries,
  listCaseInvoices as apiListCaseInvoices,
  listCasePayments as apiListCasePayments,
  getCaseRollup as apiGetCaseRollup,
  getCasesByClient as apiGetCasesByClient,
} from '@/services/api'; // :contentReference[oaicite:4]{index=4}

// ---------- THUNKS ----------

// List all cases (optionally filtered via params later if needed)
export const fetchCases = createAsyncThunk('cases/fetch', async () => {
  const { data } = await apiGetCases();
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.entries)) return data.entries;
  return [];
});




// Create new case
export const createCase = createAsyncThunk('cases/create', async (caseData) => {
  const { data } = await apiCreateCase(caseData);
  return data;
});

// Update case
export const editCase = createAsyncThunk(
  'cases/update',
  async ({ id, caseData }) => {
    const { data } = await apiUpdateCase(id, caseData);
    return data;
  }
);

// Delete case
export const removeCase = createAsyncThunk('cases/delete', async (id) => {
  await apiDeleteCase(id);
  return id;
});

// Fetch single case by id
export const fetchCaseById = createAsyncThunk(
  'cases/fetchById',
  async (id) => {
    const { data } = await apiGetCaseById(id);
    return data;
  }
);

// Transition case status
export const updateCaseStatus = createAsyncThunk(
  'cases/updateStatus',
  async ({ id, status, closedAt }) => {
    const { data } = await apiTransitionCaseStatus(id, { status, closedAt });
    return data;
  }
);

// Time entries for a case
export const fetchCaseTimeEntries = createAsyncThunk(
  'cases/fetchTimeEntries',
  async ({ caseId, params = {} }) => {
    const { data } = await apiListCaseTimeEntries(caseId, params);
    return { caseId, ...data }; // data is expected to contain { data: items, meta }
  }
);

// Invoices for a case
export const fetchCaseInvoices = createAsyncThunk(
  'cases/fetchInvoices',
  async (caseId) => {
    const { data } = await apiListCaseInvoices(caseId);
    return { caseId, items: data };
  }
);

// Payments for a case
export const fetchCasePayments = createAsyncThunk(
  'cases/fetchPayments',
  async (caseId) => {
    const { data } = await apiListCasePayments(caseId);
    return { caseId, items: data };
  }
);

// Financial rollup (WIP/Billed/AR)
export const fetchCaseRollup = createAsyncThunk(
  'cases/fetchRollup',
  async ({ caseId, params = {} }) => {
    const { data } = await apiGetCaseRollup(caseId, params);
    return { caseId, rollup: data };
  }
);

// Cases by client
export const fetchCasesByClient = createAsyncThunk(
  'cases/fetchByClient',
  async ({ clientId, params = {} }) => {
    const { data } = await apiGetCasesByClient(clientId, params);
    return { clientId, items: data };
  }
);

// ---------- SLICE ----------

const caseSlice = createSlice({
  name: 'cases',
  initialState: {
    list: [],
    loading: false,
    error: null,
    current: null,
    timeEntries: {
      byCaseId: {}, // { [caseId]: { items, meta } }
      loading: false,
      error: null,
    },
    invoices: {
      byCaseId: {},
      loading: false,
      error: null,
    },
    payments: {
      byCaseId: {},
      loading: false,
      error: null,
    },
    rollup: {
      byCaseId: {},
      loading: false,
      error: null,
    },
    byClient: {
      byClientId: {},
      loading: false,
      error: null,
    },
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // ----- list -----
      .addCase(fetchCases.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCases.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload || [];
      })
      .addCase(fetchCases.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error?.message || 'Failed to fetch cases';
      })

      // ----- create -----
      .addCase(createCase.fulfilled, (state, action) => {
        if (action.payload) state.list.push(action.payload);
      })

      // ----- update -----
      .addCase(editCase.fulfilled, (state, action) => {
        const updated = action.payload;
        if (!updated) return;
        const idx = state.list.findIndex((c) => c._id === updated._id);
        if (idx !== -1) state.list[idx] = updated;
        if (state.current && state.current._id === updated._id) {
          state.current = updated;
        }
      })

      // ----- delete -----
      .addCase(removeCase.fulfilled, (state, action) => {
        state.list = state.list.filter((c) => c._id !== action.payload);
        if (state.current && state.current._id === action.payload) {
          state.current = null;
        }
      })

      // ----- fetch single case -----
      .addCase(fetchCaseById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCaseById.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload;
        const idx = state.list.findIndex((c) => c._id === action.payload._id);
        if (idx === -1) state.list.push(action.payload);
        else state.list[idx] = action.payload;
      })
      .addCase(fetchCaseById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error?.message || 'Failed to fetch case';
      })

      // ----- status transition -----
      .addCase(updateCaseStatus.fulfilled, (state, action) => {
        const updated = action.payload;
        const idx = state.list.findIndex((c) => c._id === updated._id);
        if (idx !== -1) state.list[idx] = updated;
        if (state.current && state.current._id === updated._id) {
          state.current = updated;
        }
      })

      // ----- time entries -----
      .addCase(fetchCaseTimeEntries.pending, (state) => {
        state.timeEntries.loading = true;
        state.timeEntries.error = null;
      })
      .addCase(fetchCaseTimeEntries.fulfilled, (state, action) => {
        state.timeEntries.loading = false;
        const { caseId, data, meta } = action.payload;
        state.timeEntries.byCaseId[caseId] = { items: data || [], meta: meta || null };
      })
      .addCase(fetchCaseTimeEntries.rejected, (state, action) => {
        state.timeEntries.loading = false;
        state.timeEntries.error =
          action.error?.message || 'Failed to fetch case time entries';
      })

      // ----- invoices -----
      .addCase(fetchCaseInvoices.pending, (state) => {
        state.invoices.loading = true;
        state.invoices.error = null;
      })
      .addCase(fetchCaseInvoices.fulfilled, (state, action) => {
        state.invoices.loading = false;
        const { caseId, items } = action.payload;
        state.invoices.byCaseId[caseId] = items || [];
      })
      .addCase(fetchCaseInvoices.rejected, (state, action) => {
        state.invoices.loading = false;
        state.invoices.error =
          action.error?.message || 'Failed to fetch case invoices';
      })

      // ----- payments -----
      .addCase(fetchCasePayments.pending, (state) => {
        state.payments.loading = true;
        state.payments.error = null;
      })
      .addCase(fetchCasePayments.fulfilled, (state, action) => {
        state.payments.loading = false;
        const { caseId, items } = action.payload;
        state.payments.byCaseId[caseId] = items || [];
      })
      .addCase(fetchCasePayments.rejected, (state, action) => {
        state.payments.loading = false;
        state.payments.error =
          action.error?.message || 'Failed to fetch case payments';
      })

      // ----- rollup -----
      .addCase(fetchCaseRollup.pending, (state) => {
        state.rollup.loading = true;
        state.rollup.error = null;
      })
      .addCase(fetchCaseRollup.fulfilled, (state, action) => {
        state.rollup.loading = false;
        const { caseId, rollup } = action.payload;
        state.rollup.byCaseId[caseId] = rollup || null;
      })
      .addCase(fetchCaseRollup.rejected, (state, action) => {
        state.rollup.loading = false;
        state.rollup.error =
          action.error?.message || 'Failed to fetch case rollup';
      })

      // ----- cases by client -----
      .addCase(fetchCasesByClient.pending, (state) => {
        state.byClient.loading = true;
        state.byClient.error = null;
      })
      .addCase(fetchCasesByClient.fulfilled, (state, action) => {
        state.byClient.loading = false;
        const { clientId, items } = action.payload;
        state.byClient.byClientId[clientId] = items || [];
      })
      .addCase(fetchCasesByClient.rejected, (state, action) => {
        state.byClient.loading = false;
        state.byClient.error =
          action.error?.message || 'Failed to fetch cases by client';
      });
  },
});

export default caseSlice.reducer;
