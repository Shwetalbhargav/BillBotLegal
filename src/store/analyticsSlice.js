import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  getBillableAnalytics,
  getBilledByClientAnalytics,
  getBilledByUserAnalytics,
  getBillablesByCaseTypeAnalytics,
  getInvoiceAnalytics,
  getUnbilledAnalytics,
  getUnbilledByClientAnalytics,
  getUnbilledByUserAnalytics,
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
    byCaseType: {
      entries: unwrapArray(caseRes?.data, [
        'summaryByCaseType',
        'items',
        'data',
        'results',
      ]).map(normalizeCaseTypeRow),
    },
    unbilledByClient: {
      entries: unwrapArray(unbilledClientRes?.data, [
        'unbilledByClient',
        'items',
        'data',
        'results',
      ]).map(normalizeClientRollupRow),
    },
    unbilledByUser: {
      entries: unwrapArray(unbilledUserRes?.data, [
        'unbilledByUser',
        'items',
        'data',
        'results',
      ]).map(normalizeUserRollupRow),
    },
    billedByClient: {
      entries: unwrapArray(billedClientRes?.data, [
        'billedByClient',
        'items',
        'clients',
        'data',
        'results',
      ]).map(normalizeClientRollupRow),
    },
    billedByUser: {
      entries: unwrapArray(billedUserRes?.data, [
        'billedByUser',
        'items',
        'data',
        'results',
      ]).map(normalizeUserRollupRow),
    },
  };
});

const initialRollup = { entries: [] };

const slice = createSlice({
  name: 'analytics',
  initialState: {
    billable: initialRollup,
    invoice: initialRollup,
    unbilled: initialRollup,
    byCaseType: initialRollup,
    unbilledByClient: initialRollup,
    unbilledByUser: initialRollup,
    billedByClient: initialRollup,
    billedByUser: initialRollup,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        Object.assign(state, action.payload);
      })
      .addCase(fetchAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error?.message || 'Failed to load analytics';
      });
  },
});

export default slice.reducer;

function num(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function unwrapArray(data, keys = []) {
  if (Array.isArray(data)) return data;
  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key];
  }
  return [];
}

function normalizeBillable(data) {
  if (Array.isArray(data?.entries)) {
    return { entries: data.entries.map(normalizeEventRow) };
  }

  return {
    entries: unwrapArray(data, ['summaryByCategory']).map((row, index) =>
      normalizeEventRow({
        id: `billable-${row._id ?? index}`,
        clientName: row.clientName ?? row._id,
        caseTitle: row.caseTitle,
        userName: row.userName,
        userRole: row.userRole ?? row.role,
        hours: row.totalHours ?? row.hours,
        rate: row.rate,
        revenue: row.totalValue ?? row.revenue,
        loggedPct: row.loggedPct,
      })
    ),
  };
}

function normalizeInvoice(data) {
  if (Array.isArray(data?.entries)) {
    return { entries: data.entries.map(normalizeEventRow) };
  }

  return {
    entries: unwrapArray(data, ['invoices']).map((row, index) =>
      normalizeEventRow({
        id: `invoice-${row._id ?? index}`,
        clientName: row.clientName ?? row._id,
        caseTitle: row.caseTitle,
        userName: row.userName,
        userRole: row.userRole ?? row.role,
        hours: row.hours,
        rate: row.rate,
        revenue: row.totalRevenue ?? row.revenue,
        loggedPct: row.loggedPct,
      })
    ),
  };
}

function normalizeUnbilled(data) {
  return {
    entries: unwrapArray(data, ['entries', 'items', 'data', 'results']).map(
      normalizeEventRow
    ),
  };
}

function normalizeEventRow(row, index = 0) {
  const hours = num(row.hours ?? row.durationHours ?? num(row.durationMinutes) / 60);
  const revenue = num(row.revenue ?? row.amount ?? hours * num(row.rate));

  return {
    id: String(row.id ?? row._id ?? index),
    date: row.date ?? row.createdAt ?? null,
    client:
      row.clientName ??
      row.client ??
      row.clientId?.name ??
      row.clientId ??
      'Unknown client',
    case:
      row.caseTitle ??
      row.case ??
      row.caseId?.name ??
      row.caseId ??
      'Unknown case',
    user:
      row.userName ??
      row.user ??
      row.userId?.name ??
      row.createdBy?.name ??
      'Unknown user',
    userRole: row.userRole ?? row.role ?? row.userId?.role ?? null,
    hours,
    rate: num(row.rate ?? row.rateApplied),
    revenue,
    loggedPct: num(row.loggedPct),
  };
}

function normalizeCaseTypeRow(row, index = 0) {
  const hours = num(row.hours ?? row.totalHours);
  const revenue = num(row.revenue ?? row.totalValue);
  return {
    id: `case-type-${row._id ?? row.caseType ?? index}`,
    bucket: row.caseType ?? row.type ?? row._id ?? 'Unknown case type',
    hours,
    avgRate: num(row.avgRate ?? revenue / Math.max(1, hours)),
    revenue,
    loggedPct: num(row.loggedPct),
    entries: num(row.entries),
  };
}

function normalizeClientRollupRow(row, index = 0) {
  return {
    id: `client-rollup-${row.clientId ?? row._id ?? index}`,
    clientId: row.clientId ?? row._id,
    clientName: row.clientName ?? row.client?.name ?? row.name ?? 'Unknown client',
    hours: num(row.hours ?? row.totalHours ?? row.totalUnbilledHours),
    revenue: num(row.revenue ?? row.totalValue ?? row.totalUnbilledValue),
    entries: num(row.entries),
  };
}

function normalizeUserRollupRow(row, index = 0) {
  return {
    id: `user-rollup-${row.userId ?? row._id ?? index}`,
    userId: row.userId ?? row._id,
    userName: row.userName ?? row.user?.name ?? row.name ?? 'Unknown user',
    userRole: row.userRole ?? row.role ?? row.user?.role ?? null,
    hours: num(row.hours ?? row.totalHours ?? row.totalUnbilledHours),
    revenue: num(row.revenue ?? row.totalValue ?? row.totalUnbilledValue),
    entries: num(row.entries),
  };
}
