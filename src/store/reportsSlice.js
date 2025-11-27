// src/store/reportsSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  exportTimeEntriesCsvApi,
  exportInvoicesCsvApi,
  exportUtilizationCsvApi,
  exportReportsPdfApi,
} from "../services/api";

// NOTE: These thunks return Blob objects (binary data).
// Components can turn them into download URLs via URL.createObjectURL.

export const exportTimeEntriesCsvThunk = createAsyncThunk(
  "reports/exportTimeEntriesCsv",
  async (params, { rejectWithValue }) => {
    try {
      const res = await exportTimeEntriesCsvApi(params);
      return res.data; // Blob
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || "Failed to export time entries CSV"
      );
    }
  }
);

export const exportInvoicesCsvThunk = createAsyncThunk(
  "reports/exportInvoicesCsv",
  async (params, { rejectWithValue }) => {
    try {
      const res = await exportInvoicesCsvApi(params);
      return res.data; // Blob
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || "Failed to export invoices CSV"
      );
    }
  }
);

export const exportUtilizationCsvThunk = createAsyncThunk(
  "reports/exportUtilizationCsv",
  async (params, { rejectWithValue }) => {
    try {
      const res = await exportUtilizationCsvApi(params);
      return res.data; // Blob
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || "Failed to export utilization CSV"
      );
    }
  }
);

export const exportReportsPdfThunk = createAsyncThunk(
  "reports/exportPdf",
  async (params, { rejectWithValue }) => {
    try {
      const res = await exportReportsPdfApi(params);
      return res.data; // Blob
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || "Failed to export PDF report"
      );
    }
  }
);

const initialDownloadState = {
  loading: false,
  error: null,
  blob: null, // Blob or null
};

const initialState = {
  timeEntriesCsv: { ...initialDownloadState },
  invoicesCsv: { ...initialDownloadState },
  utilizationCsv: { ...initialDownloadState },
  pdf: { ...initialDownloadState },
};

const reportsSlice = createSlice({
  name: "reports",
  initialState,
  reducers: {
    // helper to clear a specific report download (e.g. after user closes dialog)
    clearReport(state, action) {
      const key = action.payload;
      if (state[key]) {
        state[key].blob = null;
        state[key].error = null;
        state[key].loading = false;
      }
    },
  },
  extraReducers: (builder) => {
    // ---- Time Entries CSV ----
    builder
      .addCase(exportTimeEntriesCsvThunk.pending, (state) => {
        state.timeEntriesCsv.loading = true;
        state.timeEntriesCsv.error = null;
        state.timeEntriesCsv.blob = null;
      })
      .addCase(exportTimeEntriesCsvThunk.fulfilled, (state, action) => {
        state.timeEntriesCsv.loading = false;
        state.timeEntriesCsv.blob = action.payload;
      })
      .addCase(exportTimeEntriesCsvThunk.rejected, (state, action) => {
        state.timeEntriesCsv.loading = false;
        state.timeEntriesCsv.error = action.payload || "Export failed";
      });

    // ---- Invoices CSV ----
    builder
      .addCase(exportInvoicesCsvThunk.pending, (state) => {
        state.invoicesCsv.loading = true;
        state.invoicesCsv.error = null;
        state.invoicesCsv.blob = null;
      })
      .addCase(exportInvoicesCsvThunk.fulfilled, (state, action) => {
        state.invoicesCsv.loading = false;
        state.invoicesCsv.blob = action.payload;
      })
      .addCase(exportInvoicesCsvThunk.rejected, (state, action) => {
        state.invoicesCsv.loading = false;
        state.invoicesCsv.error = action.payload || "Export failed";
      });

    // ---- Utilization CSV ----
    builder
      .addCase(exportUtilizationCsvThunk.pending, (state) => {
        state.utilizationCsv.loading = true;
        state.utilizationCsv.error = null;
        state.utilizationCsv.blob = null;
      })
      .addCase(exportUtilizationCsvThunk.fulfilled, (state, action) => {
        state.utilizationCsv.loading = false;
        state.utilizationCsv.blob = action.payload;
      })
      .addCase(exportUtilizationCsvThunk.rejected, (state, action) => {
        state.utilizationCsv.loading = false;
        state.utilizationCsv.error = action.payload || "Export failed";
      });

    // ---- PDF ----
    builder
      .addCase(exportReportsPdfThunk.pending, (state) => {
        state.pdf.loading = true;
        state.pdf.error = null;
        state.pdf.blob = null;
      })
      .addCase(exportReportsPdfThunk.fulfilled, (state, action) => {
        state.pdf.loading = false;
        state.pdf.blob = action.payload;
      })
      .addCase(exportReportsPdfThunk.rejected, (state, action) => {
        state.pdf.loading = false;
        state.pdf.error = action.payload || "Export failed";
      });
  },
});

export const { clearReport } = reportsSlice.actions;
export default reportsSlice.reducer;
