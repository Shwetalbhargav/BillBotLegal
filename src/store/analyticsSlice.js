import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getBillableAnalytics,
  getInvoiceAnalytics,
  getUnbilledAnalytics,
  getBillablesByCaseTypeAnalytics,
  getUnbilledByClientAnalytics,
  getUnbilledByUserAnalytics,
  getBilledByClientAnalytics,
  getBilledByUserAnalytics,
} from '@/services/api';

export const fetchAnalytics = createAsyncThunk('analytics/fetch', async () => {
  const [
    billableRes,
    invoiceRes,
    unbilledRes,
    caseRes,
    unbilledClientRes,
    unbilledUserRes,
    billedClientRes,
    billedUserRes,
  ] = await Promise.all([
    getBillableAnalytics(),
    getInvoiceAnalytics(),
    getUnbilledAnalytics(),
    getBillablesByCaseTypeAnalytics(),
    getUnbilledByClientAnalytics(),
    getUnbilledByUserAnalytics(),
    getBilledByClientAnalytics(),
    getBilledByUserAnalytics(),
  ]);

  return {
    billable: normalizeBillable(billableRes?.data),
    invoice: normalizeInvoice(invoiceRes?.data),
    unbilled: normalizeUnbilled(unbilledRes?.data),
    byCaseType: { entries: caseRes?.data?.summaryByCaseType || [] },
    unbilledByClient: { entries: unbilledClientRes?.data?.unbilledByClient || [] },
    unbilledByUser: { entries: unbilledUserRes?.data?.unbilledByUser || [] },
    billedByClient: { entries: billedClientRes?.data?.billedByClient || [] },
    billedByUser: { entries: billedUserRes?.data?.billedByUser || [] },
  };
});

const slice = createSlice({
  name: 'analytics',
  initialState: {
    billable: { entries: [] },
    invoice: { entries: [] },
    unbilled: { entries: [] },

    byCaseType: { entries: [] },
    unbilledByClient: { entries: [] },
    unbilledByUser: { entries: [] },
    billedByClient: { entries: [] },
    billedByUser: { entries: [] },

    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchAnalytics.pending, (s) => {
      s.loading = true;
      s.error = null;
    })
      .addCase(fetchAnalytics.fulfilled, (s, a) => {
        s.loading = false;
        Object.assign(s, a.payload);
      })
      .addCase(fetchAnalytics.rejected, (s, a) => {
        s.loading = false;
        s.error = a.error?.message || 'Failed to load analytics';
      });
  },
});

export default slice.reducer;

// --- Normalizers ---
function num(v) {
  const n = Number(v);
  return isFinite(n) ? n : 0;
}

function normalizeBillable(data) {
  if (Array.isArray(data?.entries)) return { entries: data.entries };
  const rows = Array.isArray(data?.summaryByCategory)
    ? data.summaryByCategory.map((r, i) => ({
        id: `b-${r._id ?? i}`,
        date: r.date ?? null,
        client: r.clientName ?? r._id ?? '—',
        case: r.caseTitle ?? null,
        user: r.userName ?? null,
        userRole: r.userRole ?? r.role ?? null,
        hours: num(r.totalHours ?? r.hours),
        rate: num(r.rate),
        revenue: num(r.totalValue ?? r.revenue ?? num(r.hours) * num(r.rate)),
        loggedPct: num(r.loggedPct),
      }))
    : [];
  return { entries: rows };
}

function normalizeInvoice(data) {
  if (Array.isArray(data?.entries)) return { entries: data.entries };
  const rows = Array.isArray(data?.invoices)
    ? data.invoices.map((r, i) => ({
        id: `i-${r._id ?? i}`,
        date: r.date ?? null,
        client: r.clientName ?? r._id ?? '—',
        case: r.caseTitle ?? null,
        user: r.userName ?? null,
        userRole: r.userRole ?? r.role ?? null,
        hours: num(r.hours),
        rate: num(r.rate),
        revenue: num(
          r.totalRevenue ?? r.revenue ?? num(r.hours) * num(r.rate)
        ),
        loggedPct: num(r.loggedPct),
      }))
    : [];
  return { entries: rows };
}

function normalizeUnbilled(data) {
  if (Array.isArray(data?.entries)) return { entries: data.entries };
  const rows = Array.isArray(data?.items)
    ? data.items.map((r, i) => ({
        id: `u-${r._id ?? i}`,
        date: r.date ?? null,
        client: r.clientName ?? r.client ?? '—',
        case: r.caseTitle ?? r.case ?? null,
        user: r.userName ?? r.user ?? null,
        hours: num(r.hours),
        rate: num(r.rate),
        revenue: num(r.revenue ?? num(r.hours) * num(r.rate)),
        loggedPct: num(r.loggedPct),
      }))
    : [];
  return { entries: rows };
}
