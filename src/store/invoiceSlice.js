import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getInvoices,
  createInvoice,
  getInvoiceById,
  generateInvoiceFromTime,
  sendInvoiceApi,
  voidInvoiceApi,
  getInvoicePipeline,
} from '@/services/api';


// Fetch list of invoices (supports filters: clientId, caseId, status, from, to)
export const fetchInvoices = createAsyncThunk(
  'invoices/fetch',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await getInvoices(params);
      // controller returns an array of invoices
      return data;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.error || err?.message || 'Failed to fetch invoices'
      );
    }
  }
);

// Create invoice (plain POST /api/invoices if you have it)
export const addInvoice = createAsyncThunk(
  'invoices/create',
  async (invoice, { rejectWithValue }) => {
    try {
      const { data } = await createInvoice(invoice);
      return data;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.error || err?.message || 'Failed to create invoice'
      );
    }
  }
);

// Fetch single invoice (with lines populated)
export const fetchInvoiceById = createAsyncThunk(
  'invoices/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await getInvoiceById(id);
      // controller returns { ...invoice, lines: [...] }
      return data;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.error || err?.message || 'Failed to fetch invoice'
      );
    }
  }
);

// Generate invoice from approved time entries
export const generateInvoiceFromTimeThunk = createAsyncThunk(
  'invoices/generateFromTime',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await generateInvoiceFromTime(payload);
      // controller returns the created invoice (with totals)
      return data;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.error || err?.message || 'Failed to generate invoice from time entries'
      );
    }
  }
);

// Send invoice (status -> 'sent')
export const sendInvoiceThunk = createAsyncThunk(
  'invoices/send',
  async ({ id, body = {} }, { rejectWithValue }) => {
    try {
      const { data } = await sendInvoiceApi(id, body);
      return data;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.error || err?.message || 'Failed to send invoice'
      );
    }
  }
);

// Void invoice (status -> 'void')
export const voidInvoiceThunk = createAsyncThunk(
  'invoices/void',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await voidInvoiceApi(id);
      return data;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.error || err?.message || 'Failed to void invoice'
      );
    }
  }
);

// Pipeline / kanban totals grouped by status
export const fetchInvoicePipeline = createAsyncThunk(
  'invoices/fetchPipeline',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await getInvoicePipeline(params);
      // controller returns array [{ status, count, subtotal, total }, ...]
      return data;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.error || err?.message || 'Failed to fetch invoice pipeline'
      );
    }
  }
);

const initialState = {
  list: [],
  loading: false,
  error: null,

  creating: false,
  createError: null,

  selectedInvoice: null,
  selectedLoading: false,
  selectedError: null,

  generatingFromTime: false,
  generateError: null,

  sending: false,
  sendError: null,

  voiding: false,
  voidError: null,

  pipeline: [],
  pipelineLoading: false,
  pipelineError: null,
};


const invoiceSlice = createSlice({
  name: 'invoices',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // ---- LIST ----
    builder
      .addCase(fetchInvoices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInvoices.fulfilled, (state, action) => {
        state.loading = false;
        state.list = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchInvoices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error?.message || null;
      });

    // ---- CREATE ----
    builder
      .addCase(addInvoice.pending, (state) => {
        state.creating = true;
        state.createError = null;
      })
      .addCase(addInvoice.fulfilled, (state, action) => {
        state.creating = false;
        if (action.payload) {
          state.list.unshift(action.payload);
        }
      })
      .addCase(addInvoice.rejected, (state, action) => {
        state.creating = false;
        state.createError = action.payload || action.error?.message || null;
      });

    // ---- FETCH BY ID ----
    builder
      .addCase(fetchInvoiceById.pending, (state) => {
        state.selectedLoading = true;
        state.selectedError = null;
      })
      .addCase(fetchInvoiceById.fulfilled, (state, action) => {
        state.selectedLoading = false;
        state.selectedInvoice = action.payload || null;

        // keep list in sync if it already contains this invoice
        const inv = action.payload;
        if (inv) {
          const id = inv._id || inv.id;
          const idx = state.list.findIndex(
            (x) => String(x._id || x.id) === String(id)
          );
          if (idx !== -1) {
            state.list[idx] = inv;
          }
        }
      })
      .addCase(fetchInvoiceById.rejected, (state, action) => {
        state.selectedLoading = false;
        state.selectedError = action.payload || action.error?.message || null;
      });

    // ---- GENERATE FROM TIME ----
    builder
      .addCase(generateInvoiceFromTimeThunk.pending, (state) => {
        state.generatingFromTime = true;
        state.generateError = null;
      })
      .addCase(generateInvoiceFromTimeThunk.fulfilled, (state, action) => {
        state.generatingFromTime = false;
        const inv = action.payload;
        if (inv) {
          state.list.unshift(inv);
          state.selectedInvoice = inv;
        }
      })
      .addCase(generateInvoiceFromTimeThunk.rejected, (state, action) => {
        state.generatingFromTime = false;
        state.generateError = action.payload || action.error?.message || null;
      });

    // ---- SEND INVOICE ----
    builder
      .addCase(sendInvoiceThunk.pending, (state) => {
        state.sending = true;
        state.sendError = null;
      })
      .addCase(sendInvoiceThunk.fulfilled, (state, action) => {
        state.sending = false;
        const inv = action.payload;
        if (!inv) return;
        const id = inv._id || inv.id;

        const idx = state.list.findIndex(
          (x) => String(x._id || x.id) === String(id)
        );
        if (idx !== -1) {
          state.list[idx] = inv;
        }
        if (state.selectedInvoice && String(state.selectedInvoice._id || state.selectedInvoice.id) === String(id)) {
          state.selectedInvoice = inv;
        }
      })
      .addCase(sendInvoiceThunk.rejected, (state, action) => {
        state.sending = false;
        state.sendError = action.payload || action.error?.message || null;
      });

    // ---- VOID INVOICE ----
    builder
      .addCase(voidInvoiceThunk.pending, (state) => {
        state.voiding = true;
        state.voidError = null;
      })
      .addCase(voidInvoiceThunk.fulfilled, (state, action) => {
        state.voiding = false;
        const inv = action.payload;
        if (!inv) return;
        const id = inv._id || inv.id;

        const idx = state.list.findIndex(
          (x) => String(x._id || x.id) === String(id)
        );
        if (idx !== -1) {
          state.list[idx] = inv;
        }
        if (state.selectedInvoice && String(state.selectedInvoice._id || state.selectedInvoice.id) === String(id)) {
          state.selectedInvoice = inv;
        }
      })
      .addCase(voidInvoiceThunk.rejected, (state, action) => {
        state.voiding = false;
        state.voidError = action.payload || action.error?.message || null;
      });

    // ---- PIPELINE ----
    builder
      .addCase(fetchInvoicePipeline.pending, (state) => {
        state.pipelineLoading = true;
        state.pipelineError = null;
      })
      .addCase(fetchInvoicePipeline.fulfilled, (state, action) => {
        state.pipelineLoading = false;
        state.pipeline = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchInvoicePipeline.rejected, (state, action) => {
        state.pipelineLoading = false;
        state.pipelineError = action.payload || action.error?.message || null;
      });
  },
});

export default invoiceSlice.reducer;
