// src/pages/AnalyticsPage.jsx — API‑integrated
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAnalytics } from "@/store/analyticsSlice";
import { getBillableStatsByCaseType } from "@/services/api";

import { Button, Loader } from "@/components/common";
import { Input, Select, DatePicker } from "@/components/form";
import { DataTable, TableToolbar } from "@/components/table";/* ---------------- Role & Permission helpers (RBAC) ---------------- */
function derivePermissions(role, explicitReadOnly=false) {
  const r = String(role || "intern").toLowerCase();
  const isAdmin = r === "admin";
  const isPartner = r === "partner";
  const isLawyer = r === "lawyer";
  const isAssociate = r === "associate";
  const isIntern = r === "intern";

  const canEdit = isAdmin || isPartner || isLawyer;
  const canApprove = isAdmin || isPartner;
  const canInvoice = isAdmin || isPartner;
  const canDelete = isAdmin;
  const canViewAnalytics = isAdmin || isPartner;
  const readOnly = !!explicitReadOnly || isIntern || isAssociate;

  // scope: "all" | "team" | "self"
  const scope = isAdmin ? "all" : isPartner ? "team" : "self";

  return { isAdmin, isPartner, isLawyer, isAssociate, isIntern, canEdit, canApprove, canInvoice, canDelete, canViewAnalytics, readOnly, scope };
}



export default function AnalyticsPage({ role="intern", readOnly=false, filters: externalFilters = {} , mode, currentUserId } = {}) {
  const perms = derivePermissions(role, readOnly);
  const roleScope = perms.scope;
  const effectiveFilters = { ...externalFilters, scope: roleScope };

  const dispatch = useDispatch();
  const { billable, invoice, loading, error } = useSelector((s) => s.analytics || {});
  const cases = useSelector((s) => s.cases?.list || []);

  const [filters, setFilters] = useState({ q: "", groupBy: "user", from: "", to: "", roles: ["Partner","Lawyer"], excludeInterns: true, caseStatus: "ALL" });
  const [sort, setSort] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // server aggregate for case-type view
  const [caseTypeAgg, setCaseTypeAgg] = useState([]);
  const [caseTypeLoading, setCaseTypeLoading] = useState(false);

  useEffect(() => { dispatch(fetchAnalytics()); }, [dispatch]);
  useEffect(() => {
    if (filters.groupBy !== "caseType") return;
    (async () => {
      try {
        setCaseTypeLoading(true);
        const res = await getBillableStatsByCaseType();
        const arr = Array.isArray(res?.data?.items) ? res.data.items : Array.isArray(res?.data) ? res.data : [];
        // normalize to common columns
        const mapped = arr.map((x, i) => ({ id: String(x.id ?? i), bucket: x.caseType || x.type || "—", hours: num(x.hours), avgRate: num(x.avgRate || (num(x.revenue)/Math.max(1,num(x.hours)))), revenue: num(x.revenue), loggedPct: num(x.loggedPct) }));
        setCaseTypeAgg(mapped);
      } finally { setCaseTypeLoading(false); }
    })();
  }, [filters.groupBy]);

  const caseStatusMap = useMemo(() => {
    const map = new Map();
    for (const c of Array.isArray(cases) ? cases : []) {
      const status = c?.status || c?.caseStatus || "Unknown";
      if (c?._id)   map.set(c._id, status);
      if (c?.title) map.set(c.title, status);
    }
    return map;
  }, [cases]);

  const events = useMemo(() => normalizeEvents(billable, invoice, caseStatusMap), [billable, invoice, caseStatusMap]);

  const filtered = useMemo(() => {
    if (filters.groupBy === "caseType") return caseTypeAgg; // server-prepped list

    let rows = events;
    // Role / Intern filter
    rows = rows.filter((r) => {
      const role = (r.userRole || "").toLowerCase();
      if (filters.excludeInterns && role.includes("intern")) return false;
      if (!role) return true;
      if (filters.roles?.length) return filters.roles.some(sel => role.includes(sel.toLowerCase()));
      return true;
    });

    if (filters.caseStatus && filters.caseStatus !== "ALL") rows = rows.filter((r) => (r.caseStatus || "Unknown") === filters.caseStatus);

    const { q, from, to } = filters;
    if (from) rows = rows.filter((r) => safeDate(r.date) >= safeDate(from));
    if (to)   rows = rows.filter((r) => safeDate(r.date) <= safeDate(to));
    if (q) {
      const needle = q.toLowerCase();
      rows = rows.filter((r) => String(r.client||"").toLowerCase().includes(needle) || String(r.case||"").toLowerCase().includes(needle) || String(r.user||"").toLowerCase().includes(needle));
    }
    return rows;
  }, [events, filters, caseTypeAgg]);

  const grouped = useMemo(() => {
    if (filters.groupBy === "caseType") return filtered; // already aggregated by server
    return groupRows(filtered, filters.groupBy);
  }, [filtered, filters.groupBy]);

  const sorted = useMemo(() => {
    if (!sort) return grouped;
    const { id, desc } = sort; const clone = [...grouped];
    clone.sort((a, b) => {
      const av = a[id]; const bv = b[id];
      if (av == null && bv == null) return 0;
      if (av == null) return desc ? 1 : -1;
      if (bv == null) return desc ? -1 : 1;
      if (typeof av === "number" && typeof bv === "number") return desc ? bv - av : av - bv;
      return desc ? String(bv).localeCompare(String(av)) : String(av).localeCompare(String(bv));
    });
    return clone;
  }, [grouped, sort]);

  const total = sorted.length;
  const paged = useMemo(() => sorted.slice((page - 1) * pageSize, page * pageSize), [sorted, page, pageSize]);

  const kpis = useMemo(() => {
    const base = filters.groupBy === "caseType" ? filtered : events;
    const hours = base.reduce((s, r) => s + (r.hours || 0), 0);
    const revenue = base.reduce((s, r) => s + (r.revenue || 0), 0);
    const avgRate = hours ? revenue / hours : 0;
    const loggedPct = avgPct(base.map((r) => r.loggedPct).filter((v) => isFinite(v)));
    return { hours, revenue, avgRate, loggedPct };
  }, [filtered, events, filters.groupBy]);

  const columns = useMemo(() => buildColumns(filters.groupBy), [filters.groupBy]);

  return (
    <div className="lb-reset p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Lawyer Performance Analytics</h1>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => dispatch(fetchAnalytics())}>Refresh</Button>
        </div>
      </div>

      <TableToolbar>
        <Input placeholder="Search client/case/user…" value={filters.q} onChange={(e) => { setPage(1); setFilters((f) => ({ ...f, q: e.target.value })); }} />
        <Select value={filters.groupBy} onChange={(e) => { setPage(1); setFilters((f) => ({ ...f, groupBy: e.target.value })); }}>
          <option value="user">By Attorney</option>
          <option value="client">By Client</option>
          <option value="case">By Case</option>
          <option value="date">By Date</option>
          <option value="caseType">By Case Type (server)</option>
        </Select>
        <Select value={JSON.stringify(filters.roles)} onChange={(e) => { setPage(1); const val = JSON.parse(e.target.value); setFilters((f) => ({ ...f, roles: val })); }}>
          <option value={JSON.stringify(["Partner","Lawyer"])}>Partners & Lawyers</option>
          <option value={JSON.stringify(["Partner"]) }>Partners only</option>
          <option value={JSON.stringify(["Lawyer"])  }>Lawyers only</option>
          <option value={JSON.stringify([])            }>All roles</option>
        </Select>
        <Select value={filters.caseStatus} onChange={(e) => { setPage(1); setFilters((f) => ({ ...f, caseStatus: e.target.value })); }}>
          <option value="ALL">All Statuses</option>
          <option value="Open">Open</option>
          <option value="In Progress">In Progress</option>
          <option value="Closed">Closed</option>
        </Select>
        <DatePicker label={null} placeholder="From" value={filters.from} onChange={(v) => { setPage(1); setFilters((f) => ({ ...f, from: v })); }} size="sm" />
        <DatePicker label={null} placeholder="To"   value={filters.to}   onChange={(v) => { setPage(1); setFilters((f) => ({ ...f, to: v })); }} size="sm" />
      </TableToolbar>

      {/* KPIs */}
      {perms.canViewAnalytics ? <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6"> : null}
        <KpiCard label="Total Hours" value={fmtNumber(kpis.hours)} loading={loading || (filters.groupBy === "caseType" && caseTypeLoading)} />
        <KpiCard label="Revenue" value={fmtCurrency(kpis.revenue)} loading={loading || (filters.groupBy === "caseType" && caseTypeLoading)} />
        <KpiCard label="Avg Rate" value={fmtCurrency(kpis.avgRate)} loading={loading || (filters.groupBy === "caseType" && caseTypeLoading)} />
        <KpiCard label="Logged %" value={fmtPercent(kpis.loggedPct)} loading={loading || (filters.groupBy === "caseType" && caseTypeLoading)} />
      </div>

      {perms.canViewAnalytics && (
      <DataTable
        columns={columns}
        data={paged}
        total={total}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
        sort={sort}
        onSortChange={setSort}
        rowKey={(r) => r.id}
        loading={!!loading || (filters.groupBy === "caseType" && caseTypeLoading)}
        stickyHeader
      />)}

      {error && <div className="lb-error mt-3">{String(error)}</div>}
    </div>
  );
}

/* ---------------- helpers ---------------- */
function normalizeEvents(billable, invoice, caseStatusMap) {
  const map = caseStatusMap instanceof Map ? caseStatusMap : new Map();
  const statusOf = (k) => (k ? map.get?.(k) ?? "Unknown" : "Unknown");
  const items = [];

  if (billable && Array.isArray(billable.entries)) {
    for (const e of billable.entries) {
      const caseKey = e.caseId ?? e.caseTitle ?? e.case;
      items.push({ id: `b-${e.id ?? items.length}` , date: e.date ?? null, client: e.clientName ?? e.client ?? null, case: e.caseTitle ?? e.case ?? null, user: e.userName ?? e.user ?? null, userRole: e.userRole ?? e.role ?? null, caseStatus: statusOf(caseKey), hours: num(e.hours), rate: num(e.rate), revenue: num(e.revenue ?? (num(e.hours) * num(e.rate))), loggedPct: num(e.loggedPct) });
    }
  }
  if (invoice && Array.isArray(invoice.entries)) {
    for (const e of invoice.entries) {
      const caseKey = e.caseId ?? e.caseTitle ?? e.case;
      items.push({ id: `i-${e.id ?? items.length}` , date: e.date ?? null, client: e.clientName ?? e.client ?? null, case: e.caseTitle ?? e.case ?? null, user: e.userName ?? e.user ?? null, userRole: e.userRole ?? e.role ?? null, caseStatus: statusOf(caseKey), hours: num(e.hours), rate: num(e.rate), revenue: num(e.revenue ?? (num(e.hours) * num(e.rate))), loggedPct: num(e.loggedPct) });
    }
  }
  return items;
}

function groupRows(rows, groupBy) {
  const map = new Map();
  const keyOf = (r) => (groupBy === "client" ? r.client || "—" : groupBy === "case" ? r.case || "—" : groupBy === "user" ? r.user || "—" : (r.date ? new Date(r.date).toISOString().slice(0, 10) : "—"));
  for (const r of rows) {
    const k = keyOf(r);
    const prev = map.get(k) || { id: k, bucket: k, hours: 0, revenue: 0, sumRate: 0, rateDen: 0, sumPct: 0, pctDen: 0 };
    prev.hours += r.hours || 0; prev.revenue += r.revenue || 0; if (isFinite(r.rate)) { prev.sumRate += r.rate; prev.rateDen += 1; } if (isFinite(r.loggedPct)) { prev.sumPct += r.loggedPct; prev.pctDen += 1; }
    map.set(k, prev);
  }
  return Array.from(map.values()).map((v) => ({ id: String(v.id), bucket: v.bucket, hours: round(v.hours), avgRate: v.rateDen ? round(v.sumRate / v.rateDen) : 0, revenue: round(v.revenue), loggedPct: v.pctDen ? v.sumPct / v.pctDen : 0 }));
}

function buildColumns(groupBy) {
  const first = groupBy === "client" ? "Client" : groupBy === "case" ? "Case" : groupBy === "user" ? "Attorney" : groupBy === "caseType" ? "Case Type" : "Date";
  return [
    { id: "bucket", header: first, accessor: (r) => r.bucket, sortable: true },
    { id: "hours", header: "Hours", accessor: (r) => fmtNumber(r.hours), sortable: true, align: "right", width: 120 },
    { id: "avgRate", header: "Avg Rate", accessor: (r) => fmtCurrency(r.avgRate), sortable: true, align: "right", width: 140 },
    { id: "revenue", header: "Revenue", accessor: (r) => fmtCurrency(r.revenue), sortable: true, align: "right", width: 160 },
    { id: "loggedPct", header: "Logged %", accessor: (r) => fmtPercent(r.loggedPct), sortable: true, align: "right", width: 120 },
  ];
}

function num(v) { const n = Number(v); return isFinite(n) ? n : 0; }
function round(n) { return Math.round((n || 0) * 100) / 100; }
function safeDate(v) { try { return new Date(v).getTime(); } catch { return 0; } }
function avgPct(arr) { if (!arr.length) return 0; return arr.reduce((s,x)=>s+(isFinite(x)?x:0),0)/arr.length; }

function fmtNumber(v) { return new Intl.NumberFormat().format(Number(v || 0)); }
function fmtCurrency(v) { const n = Number(v || 0); return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(n); }
function fmtPercent(v) { const n = Number(v || 0); return `${(n * 100).toFixed(0)}%`; }

function KpiCard({ label, value, loading }) {
  return (
    <div className="rounded-[var(--lb-radius-lg)] border border-[color:var(--lb-border)] bg-[color:var(--lb-surface)] p-4">
      <div className="text-sm text-[color:var(--lb-muted)]">{label}</div>
      <div className="text-2xl font-semibold mt-1 min-h-[32px] flex items-center">{loading ? <Loader size={16} /> : value}</div>
    </div>
  );
}

// every Base component signature
export default function XxxxBase({
  role,          // "admin" | "partner" | "lawyer" | "associate" | "intern"
  readOnly,      // boolean
  filters = {},  // e.g., { assignee: userId, author: userId }
  mode,          // e.g., "approvals" for billables
} = {}) { /* keep existing body; later we’ll read props where needed */ }



// ---- Role-aware wrapper (named export) ----
export function XxxxBase({ role="intern", readOnly=false, filters = {}, mode, currentUserId } = {}, props) {
  return <AnalyticsPage role={role} readOnly={readOnly} filters={filters} mode={mode} currentUserId={currentUserId} {...props} />;
}
