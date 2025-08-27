// store/analyticsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getBillableStats, getInvoiceStats, getUnbilledBillables } from '@/services/api';

export const fetchAnalytics = createAsyncThunk('analytics/fetch', async () => {
  const [billableRes, invoiceRes, unbilledRes] = await Promise.all([
    getBillableStats(),
    getInvoiceStats(),
    getUnbilledBillables(),
  ]);

  const billable = normalizeBillable(billableRes?.data);
  const invoice  = normalizeInvoice(invoiceRes?.data);
  const unbilled = normalizeUnbilled(unbilledRes?.data);

  return { billable, invoice, unbilled };
});

const slice = createSlice({
  name: 'analytics',
  initialState: { billable: { entries: [] }, invoice: { entries: [] }, unbilled: { entries: [] }, loading: false, error: null },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchAnalytics.pending,   (s)=>{ s.loading = true; s.error = null; })
     .addCase(fetchAnalytics.fulfilled, (s,a)=>{ s.loading = false; s.billable = a.payload.billable; s.invoice = a.payload.invoice; s.unbilled = a.payload.unbilled; })
     .addCase(fetchAnalytics.rejected,  (s,a)=>{ s.loading = false; s.error = a.error?.message || 'Failed to load analytics'; });
  }
});

export default slice.reducer;

// --- adapters: API -> {entries:[]}
function num(v){ const n = Number(v); return isFinite(n)?n:0; }

function normalizeBillable(data){
  // Be permissive: support either {entries:[]} OR {summaryByCategory:[]}
  if (Array.isArray(data?.entries)) return { entries: data.entries };
  const rows = Array.isArray(data?.summaryByCategory) ? data.summaryByCategory.map((r,i)=>({
    id: `b-${r._id ?? i}`,
    date: r.date ?? null,
    client: r.clientName ?? r._id ?? '—',
    case: r.caseTitle ?? null,
    user: r.userName ?? null,
    userRole: r.userRole ?? r.role ?? null,
    hours: num(r.totalHours ?? r.hours),
    rate: num(r.rate),
    revenue: num(r.totalValue ?? r.revenue ?? (num(r.hours)*num(r.rate))),
    loggedPct: num(r.loggedPct),
  })) : [];
  return { entries: rows };
}

function normalizeInvoice(data){
  if (Array.isArray(data?.entries)) return { entries: data.entries };
  const rows = Array.isArray(data?.invoices) ? data.invoices.map((r,i)=>({
    id: `i-${r._id ?? i}`,
    date: r.date ?? null,
    client: r.clientName ?? r._id ?? '—',
    case: r.caseTitle ?? null,
    user: r.userName ?? null,
    userRole: r.userRole ?? r.role ?? null,
    hours: num(r.hours),
    rate: num(r.rate),
    revenue: num(r.totalRevenue ?? r.revenue ?? (num(r.hours)*num(r.rate))),
    loggedPct: num(r.loggedPct),
  })) : [];
  return { entries: rows };
}

function normalizeUnbilled(data){
  if (Array.isArray(data?.entries)) return { entries: data.entries };
  const rows = Array.isArray(data?.items) ? data.items.map((r,i)=>({
    id: `u-${r._id ?? i}`,
    date: r.date ?? null,
    client: r.clientName ?? r.client ?? '—',
    case: r.caseTitle ?? r.case ?? null,
    user: r.userName ?? r.user ?? null,
    hours: num(r.hours),
    rate: num(r.rate),
    revenue: num(r.revenue ?? (num(r.hours)*num(r.rate))),
    loggedPct: num(r.loggedPct),
  })) : [];
  return { entries: rows };
}
