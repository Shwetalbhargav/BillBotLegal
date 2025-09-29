import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

// Redux thunks wired to real APIs
import { fetchCases } from "@/store/caseSlice";
import { fetchClients } from "@/store/clientSlice";
import { fetchInvoices } from "@/store/invoiceSlice";
import { fetchBillables } from "@/store/billableSlice";
import { fetchAnalytics } from "@/store/analyticsSlice";
import { fetchEmails } from "@/store/emailSlice";
import { genEmail } from "@/store/aiSlice";

// Charts
import {
  ResponsiveContainer,
  BarChart, Bar,
  LineChart, Line,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";

// Icons
import { FiTrendingUp, FiActivity, FiClock, FiPieChart, FiBarChart2, FiMail, FiUsers, FiBriefcase, FiDollarSign, FiZap } from "react-icons/fi";

// Theme (law-firm palette)
const theme = {
  primary: "#0b3b5a", // deep navy
  accent: "#c5a156",  // gold
  surface: "#f7f8fb",
  text: "#0f172a",
  muted: "#6b7280",
  good: "#16a34a",
  warn: "#f59e0b",
  danger: "#dc2626",
};
const COLORS = ["#2563eb", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#14b8a6"];

export default function MainDashboard() {
  const dispatch = useDispatch();

  // --- Select state ---
  const cases    = useSelector((s) => s.cases?.list ?? []);
  const clients  = useSelector((s) => s.clients?.list ?? []);
  const invoices = useSelector((s) => s.invoices?.list ?? []);
  const billables= useSelector((s) => s.billables?.list ?? []);
  const analytics= useSelector((s) => s.analytics ?? {});
  const emails   = useSelector((s) => s.emails?.list ?? []);
  const aiState  = useSelector((s) => s.ai ?? { loading:false, email:""});

  const loading = [s=>s.cases, s=>s.clients, s=>s.invoices, s=>s.billables, s=>s.analytics]
    .some(sel => !!(useSelector(sel)?.loading));

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
    const now = new Date(); const y = now.getFullYear(); const m = now.getMonth();
    const res = { Partner: 0, Lawyer: 0, Intern: 0 };
    for (const b of billables) {
      const d = new Date(b.date || b.createdAt || now);
      if (d.getFullYear() === y && d.getMonth() === m) {
        const role = getRole(b);
        const revenue = Number(b.hours || 0) * Number(b.rate || b.userRate || 0);
        if (!Number.isNaN(revenue)) res[capitalize(role)] = (res[capitalize(role)] || 0) + revenue;
      }
    }
    return res;
  }, [billables]);

  const utilizationPct = useMemo(() => {
    const fromApi = analytics?.billable?.utilization ?? analytics?.invoice?.utilization;
    if (typeof fromApi === "number") return clamp01(fromApi);
    const totalHours = billables.reduce((s, b) => s + Number(b.hours || 0), 0);
    const capacity = 8 * 5 * (uniqueUsers(billables).length || 1);
    return capacity ? clamp01(totalHours / capacity) : 0;
  }, [analytics, billables]);

  // Chart data
  const earningsChart = useMemo(() => (
    Object.entries(earningsByRoleMonth).map(([k,v]) => ({ name: k, value: v }))
  ), [earningsByRoleMonth]);
  const casesChart = useMemo(() => (
    Object.entries(casesByStatus).map(([k,v]) => ({ name: k, value: v }))
  ), [casesByStatus]);

  // Chart view state toggles
  const [earningsView, setEarningsView] = useState("bar");
  const [casesView, setCasesView] = useState("pie");

  // AI prompt
  const [prompt, setPrompt] = useState("Draft a polite invoice follow‑up email to a client who is 30 days overdue.");

  return (
    <div className="p-6 mx-auto max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold" style={{ color: theme.primary }}>Firm Dashboard</h1>
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
        <Card title="Cases" icon={FiBriefcase}>
          <KpiRow label="Open" value={casesByStatus.Open} />
          <KpiRow label="On Hold" value={casesByStatus["On Hold"]} />
          <KpiRow label="Closed" value={casesByStatus.Closed} />
          <Link className="text-sm underline mt-2 inline-block" to="/cases">View all cases</Link>
        </Card>

        <Card title="Billing Status (Clients)" icon={FiDollarSign}>
          <KpiRow label="WIP (hrs)" value={fmt(billingStatus.WIP, 1)} />
          <KpiRow label="Draft" value={billingStatus.Draft} />
          <KpiRow label="Sent" value={billingStatus.Sent} />
          <KpiRow label="Overdue" value={billingStatus.Overdue} />
          <Link className="text-sm underline mt-2 inline-block" to="/invoices">Go to Invoices</Link>
        </Card>

        <Card title="Earnings by Role (Month)" icon={FiTrendingUp}>
          <KpiRow label="Partner" value={currency(earningsByRoleMonth.Partner)} />
          <KpiRow label="Lawyer" value={currency(earningsByRoleMonth.Lawyer)} />
          <KpiRow label="Intern" value={currency(earningsByRoleMonth.Intern)} />
          <Link className="text-sm underline mt-2 inline-block" to="/analytics">Drill into Analytics</Link>
        </Card>

        <Card title="Utilization" icon={FiActivity}>
          <div className="mt-1">
            <Progress value={utilizationPct * 100} />
            <div className="text-sm mt-2" style={{ color: theme.muted }}>{`${Math.round(utilizationPct*100)}% logged vs capacity`}</div>
          </div>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
        <ChartCard title="Earnings by Role" icon={FiBarChart2} view={earningsView} setView={setEarningsView} data={earningsChart} />
        <ChartCard title="Cases by Status" icon={FiPieChart} view={casesView} setView={setCasesView} data={casesChart} defaultView="pie" />
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
            data={agingClients(invoices, clients)}
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
            data={recentBillables(billables, clients, cases)}
            rowKey={(r) => r.id}
            columns={[
              new TColumn("Subject", (row) => <Link className="underline" to={`/billables?billableId=${row.id}`}>{row.subject}</Link>),
              new TColumn("Client / Case", (row) => `${row.clientName || "—"} • ${row.caseName || "—"}`),
              new TColumn("User", (row) => row.user || "—"),
              new TColumn("Hours", (row) => row.hours),
              new TColumn("Status", (row) => <StatusBadge status={row.status} />),
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
              new TColumn("Status", (row) => <StatusBadge status={row.status} />),
            ]}
            pageSize={5}
            pagination={false}
          />
        </TableCard>
      </div>

      {/* AI Assist */}
      <div className="grid grid-cols-1 mt-6">
        <div className="p-4 border rounded-2xl bg-white shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 font-semibold"><FiZap color={theme.accent}/> AI Assist</div>
            <div className="text-xs" style={{ color: theme.muted }}>Powered by your /generate-email API</div>
          </div>
          <div className="flex gap-2">
            <input
              className="flex-1 border rounded-lg px-3 py-2"
              placeholder="Describe the email you want…"
              value={prompt}
              onChange={(e)=>setPrompt(e.target.value)}
            />
            <button
              className="px-4 py-2 rounded-lg text-white"
              style={{ background: theme.primary }}
              onClick={()=>dispatch(genEmail(prompt))}
              disabled={aiState.loading}
            >
              {aiState.loading ? "Generating…" : "Generate"}
            </button>
          </div>
          {aiState.email && (
            <div className="mt-3 p-3 border rounded-lg bg-[color:var(--lb-surface)]/40">
              <div className="text-sm mb-1" style={{ color: theme.muted }}><FiMail className="inline mr-1"/>Suggested Email</div>
              <pre className="whitespace-pre-wrap text-sm">{aiState.email}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ---- UI helpers -------------------------------------------------------------
import { Badge as CBadge } from "@/components/common";
import { DataTable, Column as TColumn } from "@/components/table";

function QuickLink({ to, label }) {
  return (
    <Link to={to} className="px-3 py-2 rounded-2xl shadow-sm border hover:shadow transition text-sm bg-white">
      {label}
    </Link>
  );
}

function Card({ title, icon: Icon, children }) {
  return (
    <div className="p-4 border rounded-2xl bg-white shadow-sm">
      <div className="text-sm flex items-center gap-2" style={{ color: theme.muted }}>
        {Icon && <Icon color={theme.primary} />}<span>{title}</span>
      </div>
      <div className="mt-2 space-y-1">{children}</div>
    </div>
  );
}

function TableCard({ title, to, children }) {
  return (
    <div className="p-4 border rounded-2xl bg-white shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="font-semibold" style={{ color: theme.text }}>{title}</div>
        <Link to={to} className="text-sm underline">View all</Link>
      </div>
      {children}
    </div>
  );
}

function KpiRow({ label, value }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <div style={{ color: theme.muted }}>{label}</div>
      <div className="font-semibold">{value ?? "—"}</div>
    </div>
  );
}

function Progress({ value = 0 }) {
  return (
    <div className="w-full h-2 bg-gray-200 rounded-xl overflow-hidden">
      <div className="h-2" style={{ width: `${Math.min(100, Math.max(0, value))}%`, background: theme.primary }} />
    </div>
  );
}

function ChartCard({ title, icon: Icon, data, view: controlledView, setView, defaultView = "bar" }){
  const [view, setLocal] = useState(defaultView);
  const v = controlledView ?? view;
  const setV = setView ?? setLocal;

  const common = (
    <>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
      <YAxis tick={{ fontSize: 12 }} />
      <Tooltip /><Legend />
    </>
  );

  return (
    <div className="p-4 border rounded-2xl bg-white shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 font-semibold" style={{ color: theme.text }}>{Icon && <Icon color={theme.primary}/>} {title}</div>
        <div className="flex gap-2">
          <Toggle onClick={()=>setV("bar")} active={v==="bar"}><FiBarChart2/> Bar</Toggle>
          <Toggle onClick={()=>setV("line")} active={v==="line"}><FiTrendingUp/> Line</Toggle>
          <Toggle onClick={()=>setV("pie")} active={v==="pie"}><FiPieChart/> Pie</Toggle>
        </div>
      </div>

      {v === "bar" && (
        <div style={{ width: "100%", height: 260 }}>
          <ResponsiveContainer>
            <BarChart data={data}>{common}<Bar dataKey="value" fill={theme.primary} /></BarChart>
          </ResponsiveContainer>
        </div>
      )}
      {v === "line" && (
        <div style={{ width: "100%", height: 260 }}>
          <ResponsiveContainer>
            <LineChart data={data}>{common}<Line type="monotone" dataKey="value" stroke={theme.primary} dot={false}/></LineChart>
          </ResponsiveContainer>
        </div>
      )}
      {v === "pie" && (
        <div style={{ width: "100%", height: 260 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90}>
                {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip/><Legend/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

function Toggle({ active, children, onClick }){
  return (
    <button onClick={onClick} className={`px-2 py-1 text-xs rounded border ${active?"text-white" : ""}`} style={{ background: active? theme.primary: undefined, borderColor: theme.primary }}>
      <span className="inline-flex items-center gap-1">{children}</span>
    </button>
  );
}

function StatusBadge({ status }){
  const tone = status === "Logged" ? "#16a34a" : status === "Failed" ? theme.danger : theme.warn;
  return <span className="px-2 py-1 text-xs rounded-full" style={{ background: `${tone}22`, color: tone }}>{status}</span>;
}

function currency(v) { if (v == null || Number.isNaN(v)) return "—"; return new Intl.NumberFormat(undefined, { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(v); }
function fmt(v, digits = 0) { if (v == null || Number.isNaN(v)) return "—"; return Number(v).toFixed(digits); }

// ---- util helpers ------------------------------------------------------------
function clamp01(v){ return Math.max(0, Math.min(1, Number(v) || 0)); }
function capitalize(s){ return (s||"").charAt(0).toUpperCase() + (s||"").slice(1); }
function getRole(b){ return (b.userRole || b.role || b.user?.role || "Lawyer").toString(); }
function normCaseStatus(s){ const t = (s || "").toLowerCase(); if (t === "open") return "Open"; if (t === "closed") return "Closed"; if (t === "pending") return "On Hold"; return "Open"; }
function normInvStatus(s){ const t = (s || "").toLowerCase(); if (t === "draft") return "Draft"; if (t === "sent") return "Sent"; if (t === "paid") return "Paid"; if (t === "overdue") return "Overdue"; return "Draft"; }
function findCaseTitle(cases, id){ const c = cases?.find?.(x => (x._id||x.id) === id); return c?.title || c?.name; }
function idStr(v){ const x = v?._id ?? v?.id ?? v; return typeof x === "string" ? x : x?.toString?.() ?? ""; }
function findClientName(clients, id){ const target = idStr(id); const c = clients?.find?.(x => idStr(x) === target); return c?.name; }
function uniqueUsers(billables) { const ids = new Set(); for (const b of billables) { const id = b.userId || b.user?._id || b.userName; if (id) ids.add(id); } return Array.from(ids); }

function recentBillables(billables, clients, cases){
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
}

function agingClients(invoices, clients){
  const map = new Map();
  for (const inv of invoices) {
    const clientId = inv.clientId || inv.client?._id || inv.client;
    const clientName = inv.clientName || inv.client?.name || findClientName(clients, clientId) || "Client";
    const amount = Number(inv.totalAmount ?? inv.amount ?? inv.total ?? 0);
    const paid   = Number(inv.paidAmount ?? inv.amountPaid ?? 0);
    const due    = Math.max(0, amount - paid);
    const st   = normInvStatus(inv.status);
    const days = inv.daysOverdue ?? daysFromDue(inv.dueDate);
    if (due > 0 && (st === "Sent" || st === "Overdue")) {
      const key = idStr(clientId);
      const cur = map.get(key) || { id: key, name: clientName, outstanding: 0, days: 0 };
      cur.outstanding += due; cur.days = Math.max(cur.days, days);
      map.set(key, cur);
    }
  }
  return Array.from(map.values()).sort((a,b) => b.outstanding - a.outstanding).slice(0,5);
}

function daysFromDue(dueDate){ if (!dueDate) return 0; const ms = Date.now() - new Date(dueDate).getTime(); return Math.max(0, Math.floor(ms / 86400000)); }
