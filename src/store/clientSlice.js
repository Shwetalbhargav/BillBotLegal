// src/store/clientSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  listClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  assignClientOwner,
  listClientCases,
  listClientInvoices,
  listClientPayments,
  getClientSummary,
} from '@/services/api';


// ---------- THUNKS ----------

// List all clients
export const fetchClientThunk = createAsyncThunk(
  'clients/fetch',
  async () => {
    const res = await listClients();
    return res.data.data; // array of clients
  }
);

// Create client
export const createClientThunk = createAsyncThunk(
  'clients/create',
  async (client) => {
    const res = await createClient(client);
    return res.data.data; // created client doc
  }
);

// Update client
export const updateClientThunk = createAsyncThunk(
  'clients/update',
  async ({ id, client }) => {
    const res = await updateClient(id, client);
    return res.data.data; // updated client doc
  }
);

// Delete client
export const deleteClientThunk = createAsyncThunk(
  'clients/delete',
  async (id) => {
    await deleteClient(id);
    return id;
  }
);

// Fetch single client by id
export const fetchClientByIdThunk = createAsyncThunk(
  'clients/fetchById',
  async (id) => {
    const res = await getClientById(id);
    return res.data.data; // single client doc
  }
);

// Assign owner / payment terms
export const assignClientOwnerThunk = createAsyncThunk(
  'clients/assignOwner',
  async ({ id, ownerUserId, paymentTerms }) => {
    const payload = {};
    if (ownerUserId) payload.ownerUserId = ownerUserId;
    if (paymentTerms) payload.paymentTerms = paymentTerms;

    const res = await assignClientOwner(id, payload);
    return res.data.data; // updated client
  }
);

// Related: cases for a client
export const fetchClientCasesThunk = createAsyncThunk(
  'clients/fetchCases',
  async ({ clientId, params = {} }) => {
    const res = await listClientCases(clientId, params);
    return { clientId, items: res.data.data };
  }
);

// Related: invoices for a client
export const fetchClientInvoicesThunk = createAsyncThunk(
  'clients/fetchInvoices',
  async ({ clientId, params = {} }) => {
    const res = await listClientInvoices(clientId, params);
    return { clientId, items: res.data.data };
  }
);

// Related: payments for a client
export const fetchClientPaymentsThunk = createAsyncThunk(
  'clients/fetchPayments',
  async ({ clientId, params = {} }) => {
    const res = await listClientPayments(clientId, params);
    return { clientId, items: res.data.data };
  }
);

// Financial summary (WIP/Billed/AR) for a client
export const fetchClientSummaryThunk = createAsyncThunk(
  'clients/fetchSummary',
  async ({ clientId, params = {} }) => {
    const res = await getClientSummary(clientId, params);
    return { clientId, summary: res.data.data };
  }
);

const clientSlice = createSlice({
  name: 'clients',
  initialState: {
    list: [],
    loading: false,
    error: null,
    current: null,
    casesByClientId: {},
    invoicesByClientId: {},
    paymentsByClientId: {},
    summariesByClientId: {},
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // ----- fetch all -----
      .addCase(fetchClientThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClientThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload || [];
      })
      .addCase(fetchClientThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error?.message || 'Failed to fetch clients';
      })

      // ----- create -----
      .addCase(createClientThunk.fulfilled, (state, action) => {
        if (action.payload) state.list.push(action.payload);
      })
      .addCase(createClientThunk.rejected, (state, action) => {
        state.error = action.error?.message || 'Failed to create client';
      })

      // ----- update -----
      .addCase(updateClientThunk.fulfilled, (state, action) => {
        const updated = action.payload;
        if (!updated) return;
        const idx = state.list.findIndex((c) => c._id === updated._id);
        if (idx !== -1) state.list[idx] = updated;
        if (state.current && state.current._id === updated._id) {
          state.current = updated;
        }
      })
      .addCase(updateClientThunk.rejected, (state, action) => {
        state.error = action.error?.message || 'Failed to update client';
      })

      // ----- delete -----
      .addCase(deleteClientThunk.fulfilled, (state, action) => {
        state.list = state.list.filter((c) => c._id !== action.payload);
        if (state.current && state.current._id === action.payload) {
          state.current = null;
        }
      })
      .addCase(deleteClientThunk.rejected, (state, action) => {
        state.error = action.error?.message || 'Failed to delete client';
      })

      // ----- fetch single client -----
      .addCase(fetchClientByIdThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClientByIdThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload;
        const idx = state.list.findIndex((c) => c._id === action.payload._id);
        if (idx === -1) state.list.push(action.payload);
        else state.list[idx] = action.payload;
      })
      .addCase(fetchClientByIdThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error?.message || 'Failed to fetch client';
      })

      // ----- assign owner / payment terms -----
      .addCase(assignClientOwnerThunk.fulfilled, (state, action) => {
        const updated = action.payload;
        if (!updated) return;
        const idx = state.list.findIndex((c) => c._id === updated._id);
        if (idx !== -1) state.list[idx] = updated;
        if (state.current && state.current._id === updated._id) {
          state.current = updated;
        }
      })
      .addCase(assignClientOwnerThunk.rejected, (state, action) => {
        state.error = action.error?.message || 'Failed to assign owner';
      })

      // ----- related: cases -----
      .addCase(fetchClientCasesThunk.fulfilled, (state, action) => {
        const { clientId, items } = action.payload;
        state.casesByClientId[clientId] = items || [];
      })
      .addCase(fetchClientCasesThunk.rejected, (state, action) => {
        state.error = action.error?.message || 'Failed to fetch client cases';
      })

      // ----- related: invoices -----
      .addCase(fetchClientInvoicesThunk.fulfilled, (state, action) => {
        const { clientId, items } = action.payload;
        state.invoicesByClientId[clientId] = items || [];
      })
      .addCase(fetchClientInvoicesThunk.rejected, (state, action) => {
        state.error = action.error?.message || 'Failed to fetch client invoices';
      })

      // ----- related: payments -----
      .addCase(fetchClientPaymentsThunk.fulfilled, (state, action) => {
        const { clientId, items } = action.payload;
        state.paymentsByClientId[clientId] = items || [];
      })
      .addCase(fetchClientPaymentsThunk.rejected, (state, action) => {
        state.error = action.error?.message || 'Failed to fetch client payments';
      })

      // ----- summary -----
      .addCase(fetchClientSummaryThunk.fulfilled, (state, action) => {
        const { clientId, summary } = action.payload;
        state.summariesByClientId[clientId] = summary || null;
      })
      .addCase(fetchClientSummaryThunk.rejected, (state, action) => {
        state.error = action.error?.message || 'Failed to fetch client summary';
      });
  },
});

// ✅ Export a name that matches your import in ClientsDashboardBase.jsx
export { fetchClientThunk as fetchClients };

export default clientSlice.reducer;
