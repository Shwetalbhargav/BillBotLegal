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

  const billable = normalizeBillable(billableRes?.data);
  const invoice = normalizeInvoice(invoiceRes?.data);
  const unbilled = normalizeUnbilled(unbilledRes?.data);

  // billables-by-case-type → array OR { summaryByCaseType: [...] }
  const caseData = caseRes?.data;
  const byCaseTypeEntries = Array.isArray(caseData)
    ? caseData
    : Array.isArray(caseData?.summaryByCaseType)
    ? caseData.summaryByCaseType
    : [];

  // unbilled-by-client → { invoices: [...] }
  const ubcData = unbilledClientRes?.data;
  const unbilledByClientEntries = Array.isArray(ubcData?.invoices)
    ? ubcData.invoices
    : Array.isArray(ubcData)
    ? ubcData
    : [];

  // unbilled-by-user → { ok: true, data: [...] }
  const ubuData = unbilledUserRes?.data;
  const unbilledByUserEntries = Array.isArray(ubuData?.data)
    ? ubuData.data
    : [];

  // billed-by-client → array
  const bbcData = billedClientRes?.data;
  const billedByClientEntries = Array.isArray(bbcData)
    ? bbcData
    : Array.isArray(bbcData?.clients)
    ? bbcData.clients
    : [];

  // billed-by-user → { ok: true, data: [...] }
  const bbuData = billedUserRes?.data;
  const billedByUserEntries = Array.isArray(bbuData?.data)
    ? bbuData.data
    : [];

  return {
    billable,
    invoice,
    unbilled,
    byCaseType: { entries: byCaseTypeEntries },
    unbilledByClient: { entries: unbilledByClientEntries },
    unbilledByUser: { entries: unbilledByUserEntries },
    billedByClient: { entries: billedByClientEntries },
    billedByUser: { entries: billedByUserEntries },
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
