import React, { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

// Redux thunks wired to real APIs
import { fetchCases } from "@/store/caseSlice";
import { fetchClients } from "@/store/clientSlice";
import { fetchInvoices } from "@/store/invoiceSlice";
import { fetchBillables } from "@/store/billableSlice";
import { fetchAnalytics } from "@/store/analyticsSlice";
import { fetchEmails } from "@/store/emailSlice";



export default function MainDashboard() {
  const dispatch = useDispatch();

  // --- Select state ---
  const cases = useSelector((s) => s.cases?.list ?? []);
  const casesLoading = useSelector((s) => !!s.cases?.loading);

  const clients = useSelector((s) => s.clients?.list ?? []);
  const clientsLoading = useSelector((s) => !!s.clients?.loading);

  const invoices = useSelector((s) => s.invoices?.list ?? []);
  const invoicesLoading = useSelector((s) => !!s.invoices?.loading);

  const billables = useSelector((s) => s.billables?.list ?? []);
  const billablesLoading = useSelector((s) => !!s.billables?.loading);

  const analytics = useSelector((s) => s.analytics ?? {});
  const analyticsLoading = useSelector((s) => !!s.analytics?.loading);

  const emails = useSelector((s) => s.emails?.list ?? []);
  const emailsLoading = useSelector((s) => !!s.emails?.loading);

  const loading = casesLoading || clientsLoading || invoicesLoading || billablesLoading || analyticsLoading;

  // --- Fetch on mount ---
  useEffect(() => {
    dispatch(fetchCases());
    dispatch(fetchClients());
    dispatch(fetchInvoices());
    dispatch(fetchBillables());
    dispatch(fetchAnalytics());
    dispatch(fetchEmails());
  }, [dispatch]);

  // --- Derived KPIs ---
  const recentEmails = useMemo(() => {
    return [...emails]
      .sort((a,b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt))
      .slice(0,5)
      .map(e => ({
        id: e._id || e.id,
        subject: e.subject || e.threadSubject || "Email",
        clientName: e.clientName || e.client?.name || findClientName(clients, e.clientId || e.client),
        duration: e.durationMinutes ?? e.minutes ?? e.duration ?? 0,
        status: e.status || "Logged",
      }));
  }, [emails, clients]);
  
  const casesByStatus = useMemo(() => {
  const out = { Open: 0, "On Hold": 0, Closed: 0 };
  for (const c of cases) out[normCaseStatus(c.status)]++;
  return out;
}, [cases]);
 

const openCases = useMemo(() => cases.filter(c => normCaseStatus(c.status) === "Open").slice(0, 5), [cases]);

  

 

  const billingStatus = useMemo(() => {
  const res = { WIP: 0, Draft: 0, Sent: 0, Overdue: 0, Paid: 0 };
  for (const inv of invoices) res[normInvStatus(inv.status)] = (res[normInvStatus(inv.status)] || 0) + 1;
  for (const b of billables) if ((b.status || "").toLowerCase() === "pending") res.WIP += Number(b.hours || 0);
  return res;
}, [invoices, billables]);


  const earningsByRoleMonth = useMemo(() => {
    // Sum hours*rate for current month grouped by role
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    const res = { Partner: 0, Lawyer: 0, Intern: 0 };
    for (const b of billables) {
      const d = new Date(b.date || b.createdAt || now);
      if (d.getFullYear() === y && d.getMonth() === m) {
        const role = getRole(b);
        const revenue = Number(b.hours || 0) * Number(b.rate || b.userRate || 0);
        if (!Number.isNaN(revenue)) res[role] = (res[role] || 0) + revenue;
      }
    }
    return res;
  }, [billables]);

  const utilizationPct = useMemo(() => {
    // Prefer analytics if backend supplies utilization; otherwise quick heuristic
    const fromApi = analytics?.billable?.utilization ?? analytics?.invoice?.utilization;
    if (typeof fromApi === "number") return clamp01(fromApi);
    const totalHours = billables.reduce((s, b) => s + Number(b.hours || 0), 0);
    const capacity = 8 * 5 * (uniqueUsers(billables).length || 1); // 40h/week * #people (rough)
    return capacity ? clamp01(totalHours / capacity) : 0;
  }, [analytics, billables]);

  // --- Tables ---
  

  const agingClients = useMemo(() => {
  const map = new Map();
  for (const inv of invoices) {
    const clientId = inv.clientId || inv.client?._id || inv.client;
    const clientName = inv.clientName || inv.client?.name || findClientName(clients, clientId) || "Client";

    const amount = Number(inv.totalAmount ?? inv.amount ?? inv.total ?? 0); // backend uses totalAmount
    const paid   = Number(inv.paidAmount ?? inv.amountPaid ?? 0);          // optional, if you add later
    const due    = Math.max(0, amount - paid);

    const st   = normInvStatus(inv.status);
    const days = inv.daysOverdue ?? daysFromDue(inv.dueDate);

    if (due > 0 && (st === "Sent" || st === "Overdue")) {
      const key = idStr(clientId);
      const cur = map.get(key) || { id: key, name: clientName, outstanding: 0, days: 0 };
      cur.outstanding += due;
      cur.days = Math.max(cur.days, days);
      map.set(key, cur);
    }
  }
  return Array.from(map.values()).sort((a,b) => b.outstanding - a.outstanding).slice(0,5);
}, [invoices, clients]);


  const recentBillables = useMemo(() => {
    return [...billables]
      .sort((a,b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt))
      .slice(0,5)
      .map(b => ({
        id: b._id || b.id,
        subject: b.subject || b.activity || b.summary || "Billable",
        clientName: b.clientName || b.client?.name || findClientName(clients, b.clientId || b.client),
        caseName: b.caseName || b.case?.title || findCaseTitle(cases, b.caseId || b.case),
        user: b.userName || b.user?.name || "—",
        hours: b.hours,
        rate: b.rate,
        status: b.status || "Pending",
      }));
  }, [billables, clients, cases]);

  const leaderboard = useMemo(() => {
    // Group billables (this week) by user and sum hours & revenue
    const start = startOfWeek(new Date());
    const map = new Map();
    for (const b of billables) {
      const d = new Date(b.date || b.createdAt || Date.now());
      if (d >= start) {
        const id = b.userId || b.user?._id || b.userName || "unknown";
        const name = b.userName || b.user?.name || "Unknown";
        const role = getRole(b);
        const prev = map.get(id) || { id, name: `${capitalize(role)} • ${name}`, role: capitalize(role), hours: 0, revenue: 0 };
        prev.hours += Number(b.hours || 0);
        prev.revenue += Number(b.hours || 0) * Number(b.rate || b.userRate || 0);
        map.set(id, prev);
      }
    }
    return Array.from(map.values()).sort((a,b) => b.revenue - a.revenue).slice(0,5);
  }, [billables]);



  return (
    <div className="p-6 mx-auto max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Firm Dashboard</h1>
        <div className="flex gap-2">
          <QuickLink to="/email-entries" label="Email-Entry" />
          <QuickLink to="/cases" label="Cases" />
          <QuickLink to="/clients" label="Clients" />
          <QuickLink to="/invoices" label="Invoices" />
          <QuickLink to="/billables" label="Billables" />
          <QuickLink to="/analytics" label="Analytics" />
          <QuickLink to="/admin" label="Admin" />
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card title="Cases">
          <KpiRow label="Open" value={casesByStatus.Open} loading={loading} />
          <KpiRow label="On Hold" value={casesByStatus["On Hold"]} loading={loading} />
          <KpiRow label="Closed" value={casesByStatus.Closed} loading={loading} />
          <Link className="text-sm underline mt-2 inline-block" to="/cases">View all cases</Link>
        </Card>

        <Card title="Billing Status (Clients)">
          <KpiRow label="WIP (hrs)" value={fmt(billingStatus.WIP, 1)} loading={loading} />
          <KpiRow label="Draft" value={billingStatus.Draft} loading={loading} />
          <KpiRow label="Sent" value={billingStatus.Sent} loading={loading} />
          <KpiRow label="Partially Paid" value={billingStatus["Partially Paid"]} loading={loading} />
          <KpiRow label="Overdue" value={billingStatus.Overdue} loading={loading} />
          <Link className="text-sm underline mt-2 inline-block" to="/invoices">Go to Invoices</Link>
        </Card>

        <Card title="Earnings by Role (Month)">
          <KpiRow label="Partner" value={currency(earningsByRoleMonth.Partner)} loading={loading} />
          <KpiRow label="Lawyer" value={currency(earningsByRoleMonth.Lawyer)} loading={loading} />
          <KpiRow label="Intern" value={currency(earningsByRoleMonth.Intern)} loading={loading} />
          <Link className="text-sm underline mt-2 inline-block" to="/analytics">Drill into Analytics</Link>
        </Card>

        <Card title="Utilization">
          <div className="mt-1">
            <Progress value={utilizationPct * 100} loading={loading} />
            <div className="text-sm mt-2">{loading ? "…" : `${Math.round(utilizationPct*100)}% logged vs capacity`}</div>
          </div>
        </Card>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
        <TableCard title="Open Cases" to="/cases">
          
            <DataTable
              data={openCases}
              rowKey={(r) => r._id || r.id}
              columns={[
                new TColumn("Case", (row) => <Link className="underline" to={`/cases?caseId=${row._id || row.id}`}>{row.title || row.name}</Link>),
                new TColumn("Client", (row) => row.client?.name || row.clientName || findClientName(clients, row.clientId)),
                new TColumn("Owner", (row) => row.owner?.name || row.ownerName || "—"),
                new TColumn("Next Task", (row) => row.nextTask || row.stage || "—"),
              ]}
              pageSize={5}
              pagination={false}
            />
          
        </TableCard>

        <TableCard title="Clients with Outstanding Invoices" to="/invoices">
          
            <DataTable
              data={agingClients}
              rowKey={(r) => r.id}
              columns={[
                new TColumn("Client", (row) => <Link className="underline" to={`/clients?clientId=${row.id}`}>{row.name}</Link>),
                new TColumn("Outstanding", (row) => currency(row.outstanding)),
                new TColumn("Days", (row) => row.days ?? "—"),
              ]}
              pageSize={5}
              pagination={false}
            />
          
        </TableCard>

        <TableCard title="Recent Billables" to="/billables">
          
            <DataTable
              data={recentBillables}
              rowKey={(r) => r.id}
              columns={[
                new TColumn("Subject", (row) => <Link className="underline" to={`/billables?billableId=${row.id}`}>{row.subject}</Link>),
                new TColumn("Client / Case", (row) => `${row.clientName || "—"} • ${row.caseName || "—"}`),
                new TColumn("User", (row) => row.user || "—"),
                new TColumn("Hours", (row) => row.hours),
                new TColumn("Status", (row) => badgeEl(row.status)),
              ]}
              pageSize={5}
              pagination={false}
            />
          
        </TableCard>

        <TableCard title="Team Leaderboard (This Week)" to="/analytics?groupBy=user">
          
            <DataTable
              data={leaderboard}
              rowKey={(r) => r.id}
              columns={[
                new TColumn("User", (row) => <Link className="underline" to={`/team?userId=${row.id}`}>{row.name}</Link>),
                new TColumn("Role", (row) => row.role),
                new TColumn("Hours", (row) => row.hours.toFixed(1)),
                new TColumn("Revenue", (row) => currency(row.revenue)),
              ]}
              pageSize={5}
              pagination={false}
            />
          
        </TableCard>

        <TableCard title="Recent Emails" to="/emails">
        <DataTable
           data={recentEmails}
           rowKey={(r) => r.id}
          columns={[
         new TColumn("Subject", (row) => row.subject),
        new TColumn("Client", (row) => row.clientName || "—"),
        new TColumn("Minutes", (row) => row.duration),
        new TColumn("Status", (row) => badgeEl(row.status)),
      ]}
      pageSize={5}
      pagination={false}
    />
  </TableCard>

      </div>
    </div>
  );
}

// ---- UI: reuse your shared component library -------------------------------
import { Badge as CBadge, Button as CButton, Loader as CLoader } from "@/components/common";
import { DataTable, Column as TColumn, Pagination as TPagination, SkeletonRows as TSkeletonRows } from "@/components/table";

function QuickLink({ to, label }) {
  return (
    <Link to={to} className="px-3 py-2 rounded-2xl shadow-sm border hover:shadow transition text-sm bg-white">
      {label}
    </Link>
  );
}

function Card({ title, children }) {
  return (
    <div className="p-4 border rounded-2xl bg-white shadow-sm">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="mt-2 space-y-1">{children}</div>
    </div>
  );
}

function TableCard({ title, to, children }) {
  return (
    <div className="p-4 border rounded-2xl bg-white shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="font-semibold">{title}</div>
        <Link to={to} className="text-sm underline">View all</Link>
      </div>
      {children}
    </div>
  );
}

function KpiRow({ label, value, loading }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <div className="text-gray-600">{label}</div>
      <div className="font-semibold">{loading ? "…" : (value ?? "—")}</div>
    </div>
  );
}

function Progress({ value = 0, loading }) {
  return (
    <div className="w-full h-2 bg-gray-200 rounded-xl overflow-hidden">
      <div
        className="h-2 bg-black/80"
        style={{ width: loading ? "0%" : `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}
function normCaseStatus(s){
  const t = (s || "").toLowerCase();
  if (t === "open") return "Open";
  if (t === "closed") return "Closed";
  if (t === "pending") return "On Hold";
  return "Open";
}

// Use in KPIs





function badgeEl(status) {
  const tone = status === "Logged" ? "success" : status === "Failed" ? "danger" : "warning";
  return <CBadge tone={tone}>{status}</CBadge>;
}

function currency(v) { if (v == null || Number.isNaN(v)) return "—"; return new Intl.NumberFormat(undefined, { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(v); }
function fmt(v, digits = 0) { if (v == null || Number.isNaN(v)) return "—"; return Number(v).toFixed(digits); }

// ---- util helpers ------------------------------------------------------------
function startOfWeek(d) { const x = new Date(d); const day = (x.getDay() + 6) % 7; x.setDate(x.getDate() - day); x.setHours(0,0,0,0); return x; }
function clamp01(v){ return Math.max(0, Math.min(1, Number(v) || 0)); }
function capitalize(s){ return (s||"").charAt(0).toUpperCase() + (s||"").slice(1); }
function getRole(b){ return (b.userRole || b.role || b.user?.role || "lawyer").toString().toLowerCase(); }
function findCaseTitle(cases, id){ const c = cases?.find?.(x => (x._id||x.id) === id); return c?.title || c?.name; }
function idStr(v){ const x = v?._id ?? v?.id ?? v; return typeof x === "string" ? x : x?.toString?.() ?? ""; }
function findClientName(clients, id){ const target = idStr(id); const c = clients?.find?.(x => idStr(x) === target); return c?.name; }

function uniqueUsers(billables) {
  const ids = new Set();
  for (const b of billables) {
    const id = b.userId || b.user?._id || b.userName;
    if (id) ids.add(id);
  }
  return Array.from(ids);
}
function normInvStatus(s){
  const t = (s || "").toLowerCase();
  if (t === "draft") return "Draft";
  if (t === "sent") return "Sent";
  if (t === "paid") return "Paid";
  if (t === "overdue") return "Overdue";
  return "Draft";
}
function daysFromDue(dueDate){
  if (!dueDate) return 0;
  const ms = Date.now() - new Date(dueDate).getTime();
  return Math.max(0, Math.floor(ms / 86400000));
}
