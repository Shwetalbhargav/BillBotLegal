import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

// ====== Local components (keep your existing ones) ======
import NavBar from "@/components/layout/NavBar";
import Footer from "@/components/layout/Footer";
import { Button, Badge } from "@/components/common"; // uses your existing design system

// ====== Redux thunks & selectors ======
import { fetchAnalytics } from "@/store/analyticsSlice"; // billable+invoice+unbilled
import { fetchClients } from "@/store/clientSlice";
import { fetchCases } from "@/store/caseSlice";
import { fetchInvoices } from "@/store/invoiceSlice";
import { fetchUsersThunk, getMeThunk, selectMe, selectUsers } from "@/store/usersSlice";

// ====== Icons (lucide-react) ======
import {
  Scale,
  Users,
  Briefcase,
  Trophy,
  LineChart as LineChartIcon,
  BarChart2,
  Mail,
  Award,
  Building2,
  TrendingUp,
  Sparkles,
} from "lucide-react";

// ====== Theme helpers ======
const theme = {
  primary: "#0b3b5a", // deep navy
  accent: "#c5a156", // gold
  surface: "#0b3b5a0d", // 5% navy
  muted: "#6b7280",
  good: "#16a34a",
  bad: "#dc2626",
};
const COLORS = ["#2563eb", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#14b8a6"]; // recharts category palette

// ====== Reusable UI ======
function Card({ title, icon: Icon, rightSlot, children, className = "" }) {
  return (
    <div
      className={`relative border rounded-2xl bg-white/80 backdrop-blur shadow-lg ${className}`}
      style={{ borderColor: theme.surface }}
    >
      <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: theme.surface }}>
        <div className="flex items-center gap-2">
          {Icon && <Icon size={18} color={theme.primary} />}
          <h3 className="font-semibold text-slate-800">{title}</h3>
        </div>
        <div>{rightSlot}</div>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function Metric({ label, value, icon: Icon, trend, trendColor }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex items-center gap-3 p-4 border rounded-2xl bg-white/70 backdrop-blur"
      style={{ borderColor: theme.surface }}
    >
      <div className="p-3 rounded-xl" style={{ background: theme.surface }}>
        <Icon size={18} color={theme.primary} />
      </div>
      <div className="flex-1">
        <div className="text-xs text-slate-500">{label}</div>
        <div className="text-lg font-semibold text-slate-800">{value}</div>
      </div>
      {trend != null && (
        <div className={`text-xs font-medium ${trendColor || "text-slate-500"}`}>{trend}</div>
      )}
    </motion.div>
  );
}

function ChartSwitcher({ data, view, setView, height = 260 }) {
  const common = (
    <>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
      <YAxis tick={{ fontSize: 12 }} />
      <Tooltip />
      <Legend />
    </>
  );

  return (
    <div>
      <div className="flex gap-2 justify-end mb-3">
        <Button size="sm" variant={view === "table" ? "primary" : "secondary"} onClick={() => setView("table")}>
          <BarChart2 className="mr-1" size={14} /> Table
        </Button>
        <Button size="sm" variant={view === "bar" ? "primary" : "secondary"} onClick={() => setView("bar")}>
          <BarChart2 className="mr-1" size={14} /> Bar
        </Button>
        <Button size="sm" variant={view === "pie" ? "primary" : "secondary"} onClick={() => setView("pie")}>
          <Trophy className="mr-1" size={14} /> Pie
        </Button>
        <Button size="sm" variant={view === "line" ? "primary" : "secondary"} onClick={() => setView("line")}>
          <LineChartIcon className="mr-1" size={14} /> Line
        </Button>
      </div>

      {view === "table" && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500">
                <th className="py-2 pr-4">Category</th>
                <th className="py-2">Value</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.id} className="border-t" style={{ borderColor: theme.surface }}>
                  <td className="py-2 pr-4">{row.name}</td>
                  <td className="py-2 font-medium">{Intl.NumberFormat().format(row.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {view === "bar" && (
        <div style={{ width: "100%", height }}>
          <ResponsiveContainer>
            <BarChart data={data}>
              {common}
              <Bar dataKey="value">
                {data.map((_, i) => (
                  <Cell key={`c-${i}`} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {view === "line" && (
        <div style={{ width: "100%", height }}>
          <ResponsiveContainer>
            <LineChart data={data}>
              {common}
              <Line type="monotone" dataKey="value" stroke={theme.primary} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {view === "pie" && (
        <div style={{ width: "100%", height }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie data={data} innerRadius={50} outerRadius={90} dataKey="value" nameKey="name">
                {data.map((_, i) => (
                  <Cell key={`p-${i}`} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

// ====== Helpers ======
function toNameValueRows(raw, nameKey = "name", valueKey = "value") {
  if (!raw) return [];
  const items = Array.isArray(raw) ? raw : raw.entries || raw.items || [];
  return items.map((r, i) => ({
    id: r.id || r._id || i,
    name: r[nameKey] || r.client || r.clientName || r.case || r.caseTitle || `Item ${i + 1}`,
    value: Number(r[valueKey] ?? r.revenue ?? r.total ?? r.hours ?? 0) || 0,
  }));
}

export default function LandingPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Core data
  const me = useSelector(selectMe);
  const users = useSelector(selectUsers) || [];
  const analytics = useSelector((s) => s.analytics) || {};
  const clients = useSelector((s) => s.clients.list) || [];
  const cases = useSelector((s) => s.cases.list) || [];
  const invoices = useSelector((s) => s.invoices.list) || [];

  const [revenueView, setRevenueView] = useState("line");
  const [casesView, setCasesView] = useState("bar");

  // Bootload
  useEffect(() => {
    dispatch(getMeThunk());
    dispatch(fetchAnalytics());
    dispatch(fetchUsersThunk({ limit: 100 }));
    dispatch(fetchClients());
    dispatch(fetchCases());
    dispatch(fetchInvoices());
  }, [dispatch]);

  // ====== Derived metrics ======
  const partners = useMemo(() => users.filter((u) => /partner/i.test(u.role || "")), [users]);
  const lawyers = useMemo(() => users.filter((u) => /lawyer|associate/i.test(u.role || "")), [users]);
  const interns = useMemo(() => users.filter((u) => /intern/i.test(u.role || "")), [users]);

  const caseBuckets = useMemo(() => {
    const counts = { Won: 0, Settled: 0, Lost: 0, Active: 0 };
    (cases || []).forEach((c) => {
      const s = (c.status || "").toLowerCase();
      if (s.includes("won")) counts.Won++;
      else if (s.includes("settled")) counts.Settled++;
      else if (s.includes("lost")) counts.Lost++;
      else counts.Active++;
    });
    return Object.entries(counts).map(([name, value]) => ({ id: name, name, value }));
  }, [cases]);

  const revenueSeries = useMemo(() => {
    // Build monthly revenue from invoices or analytics.invoice.entries
    const rows = (analytics.invoice?.entries?.length ? analytics.invoice.entries : invoices) || [];
    const byMonth = new Map();
    rows.forEach((r) => {
      const d = r.date ? new Date(r.date) : null;
      const key = d ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}` : "Unknown";
      const rev = Number(r.revenue ?? r.totalRevenue ?? 0) || 0;
      byMonth.set(key, (byMonth.get(key) || 0) + rev);
    });
    const arr = Array.from(byMonth.entries())
      .sort(([a], [b]) => (a > b ? 1 : -1))
      .map(([k, v], i) => ({ id: i, name: k, value: v }));
    return arr;
  }, [invoices, analytics]);

  const totalRevenue = useMemo(() => revenueSeries.reduce((s, r) => s + r.value, 0), [revenueSeries]);
  const winRate = useMemo(() => {
    const w = caseBuckets.find((x) => x.name === "Won")?.value || 0;
    const l = caseBuckets.find((x) => x.name === "Lost")?.value || 0;
    const t = w + l;
    return t ? Math.round((w / t) * 100) : 0;
  }, [caseBuckets]);

  // Leaderboards (by revenue/hours from analytics.billable)
  const billable = analytics.billable?.entries || [];
  const perfByUser = useMemo(() => {
    const m = new Map();
    billable.forEach((b) => {
      const key = b.user || b.userName || "Unknown";
      const rev = Number(b.revenue || 0);
      const hrs = Number(b.hours || 0);
      if (!m.has(key)) m.set(key, { user: key, revenue: 0, hours: 0 });
      const obj = m.get(key);
      obj.revenue += rev;
      obj.hours += hrs;
    });
    return Array.from(m.values()).sort((a, b) => b.revenue - a.revenue);
  }, [billable]);

  const topLawyers = useMemo(() => perfByUser.filter((u) => lawyers.some((l) => (l.name || l.fullName) === u.user)).slice(0, 5), [perfByUser, lawyers]);
  const topInterns = useMemo(() => perfByUser.filter((u) => interns.some((l) => (l.name || l.fullName) === u.user)).slice(0, 5), [perfByUser, interns]);

  // Prestigious clients (simple heuristic: clients with revenue in top quartile)
  const clientPerf = useMemo(() => {
    const m = new Map();
    billable.forEach((b) => {
      const key = b.client || b.clientName || "Client";
      const rev = Number(b.revenue || 0);
      m.set(key, (m.get(key) || 0) + rev);
    });
    const arr = Array.from(m.entries()).map(([name, value]) => ({ id: name, name, value }));
    const sorted = [...arr].sort((a, b) => b.value - a.value);
    const q = Math.ceil(sorted.length / 4) || 1;
    return sorted.slice(0, q);
  }, [billable]);

  // ====== UI ======
  return (
    <>
      <div className="relative overflow-hidden">
        {/* Decorative backdrop */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full" style={{ background: "radial-gradient(600px at 100% 0%, #c5a15622, transparent 60%)" }} />
          <div className="absolute -bottom-24 -left-24 h-[28rem] w-[28rem] rounded-full" style={{ background: "radial-gradient(600px at 0% 100%, #0b3b5a22, transparent 60%)" }} />
        </div>

        <NavBar />

        {/* Hero */}
        <section className="pt-28 md:pt-32 pb-10">
          <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-10 items-center">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <Badge color="primary" className="inline-flex items-center gap-2">
                <Sparkles size={14} /> New
              </Badge>
              <h1 className="text-3xl md:text-5xl font-semibold mt-3 leading-tight" style={{ color: theme.primary }}>
                {me ? `Welcome, ${me.name.split(" ")[0]} —` : "Modernize your firm —"}
                <br />
                <span className="text-slate-800">a glamorous, data‑driven legal hub.</span>
              </h1>
              <p className="mt-4 text-slate-600">
                Fetches user details, showcases prestigious clients, partner memos, leaderboards and living revenue charts. Built for real firms — not a college project.
              </p>
              <div className="mt-6 flex gap-3">
                <Button variant="primary" size="lg" onClick={() => navigate("/register")}>Get Started</Button>
                <Button variant="secondary" size="lg" onClick={() => navigate("/login")}>Sign in</Button>
              </div>
              <p className="mt-3 text-sm text-slate-500">Runs inside your stack — Gmail, PracticePanther/Clio, and more.</p>

              {/* Quick metrics */}
              <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3 max-w-3xl">
                <Metric label="Partners" value={partners.length} icon={Award} />
                <Metric label="Lawyers" value={lawyers.length} icon={Users} />
                <Metric label="Active Clients" value={clients.length} icon={Building2} />
                <Metric label="Win Rate" value={`${winRate}%`} icon={Trophy} trend={`${caseBuckets.find((x)=>x.name==='Won')?.value||0} won`} trendColor="text-emerald-600" />
              </div>
            </motion.div>

            {/* Hero visual */}
            <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }} className="relative">
              <div className="rounded-3xl border bg-white/70 backdrop-blur shadow-xl p-4" style={{ borderColor: theme.surface }}>
                <div className="flex items-center gap-2 text-slate-600 text-sm mb-2"><Mail size={16} /> Email → Billable (auto)</div>
                <div className="grid grid-cols-3 gap-2">
                  {["Drafting", "Mapping", "Logged"].map((step, i) => (
                    <div key={step} className="p-3 border rounded-xl text-center text-xs" style={{ borderColor: theme.surface }}>
                      <div className="font-semibold text-slate-800">{step}</div>
                      <div className="mt-1 text-slate-500">{i === 0 ? "Timer active" : i === 1 ? "Client matched" : "0.2h added"}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 text-[11px] text-slate-500 text-center">Animated demo clip/illustration can live here.</div>
              </div>
              <motion.div
                className="absolute -bottom-6 -right-6 hidden md:block"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="p-4 rounded-2xl border bg-white/70 backdrop-blur shadow" style={{ borderColor: theme.surface }}>
                  <div className="text-xs text-slate-500">Compliance ready</div>
                  <div className="text-sm font-semibold text-slate-800 flex items-center gap-2"><Scale size={14}/> Confidential by design</div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </div>

      {/* Cases performance */}
      <section className="py-10 bg-slate-50/60">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2">
            <Card title="Cases — Won / Settled / Lost / Active" icon={Briefcase} rightSlot={<span className="text-xs text-slate-500">live from your org</span>}>
              <ChartSwitcher data={caseBuckets} view={casesView} setView={setCasesView} />
            </Card>
          </div>
          <div className="lg:col-span-1">
            <Card title="Prestigious Clients" icon={Building2} rightSlot={<span className="text-xs text-slate-500">top quartile</span>}>
              <div className="flex flex-col gap-3">
                {clientPerf.slice(0, 8).map((c) => (
                  <div key={c.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full grid place-items-center text-xs font-semibold" style={{ background: theme.surface, color: theme.primary }}>
                        {c.name?.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="text-sm text-slate-800">{c.name}</div>
                    </div>
                    <div className="text-sm font-medium text-slate-700">${Intl.NumberFormat().format(Math.round(c.value))}</div>
                  </div>
                ))}
                {clientPerf.length === 0 && <div className="text-sm text-slate-500">No client data yet.</div>}
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Revenue */}
      <section className="py-10">
        <div className="max-w-7xl mx-auto px-6">
          <Card title="Firm Revenue (Monthly)" icon={TrendingUp} rightSlot={<span className="text-xs text-slate-500">Invoices & analytics</span>}>
            <ChartSwitcher data={revenueSeries} view={revenueView} setView={setRevenueView} />
            <div className="mt-4 flex items-center justify-end text-sm text-slate-600">
              Total: <span className="font-semibold text-slate-800 ml-1">${Intl.NumberFormat().format(Math.round(totalRevenue))}</span>
            </div>
          </Card>
        </div>
      </section>

      {/* Partners memo & profiles */}
      <section className="py-10 bg-slate-50/60">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between mb-4">
            <h2 className="text-xl font-semibold text-slate-800">Partner Memos</h2>
            <Button variant="link" onClick={() => navigate("/partners")}>View all partners</Button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {partners.slice(0, 6).map((p) => (
              <motion.div key={p._id || p.id} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <div className="p-5 border rounded-2xl bg-white/80 backdrop-blur shadow" style={{ borderColor: theme.surface }}>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full grid place-items-center font-semibold" style={{ background: theme.surface, color: theme.primary }}>
                      {(p.name || p.fullName || "P").split(" ").map((x)=>x[0]).slice(0,2).join("")}
                    </div>
                    <div>
                      <Link to={`/partners/${p._id || p.id}`} className="font-semibold text-slate-800 hover:underline">{p.name || p.fullName}</Link>
                      <div className="text-xs text-slate-500">{p.title || "Partner"}</div>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-slate-600 line-clamp-3">{p.memo || "Strategic insights, case updates and commentary. Click to read."}</p>
                  <div className="mt-3 flex gap-3 text-xs">
                    <Link to={`/partners/${p._id || p.id}/profile`} className="underline">Profile</Link>
                    <Link to={`/partners/${p._id || p.id}/blogs`} className="underline">Blogs</Link>
                    <Link to={`/partners/${p._id || p.id}/achievements`} className="underline">Achievements</Link>
                  </div>
                </div>
              </motion.div>
            ))}
            {partners.length === 0 && <div className="text-sm text-slate-600">No partners yet.</div>}
          </div>
        </div>
      </section>

      {/* Leaderboards */}
      <section className="py-10">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-6">
          <Card title="Top Lawyers" icon={Award}>
            <div className="space-y-3">
              {topLawyers.map((u, i) => (
                <div key={u.user} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full grid place-items-center text-xs font-semibold" style={{ background: theme.surface, color: theme.primary }}>{(u.user || "U").split(" ").map((x)=>x[0]).slice(0,2).join("")}</div>
                    <div className="text-sm text-slate-800">{u.user}</div>
                  </div>
                  <div className="text-sm text-slate-700">${Intl.NumberFormat().format(Math.round(u.revenue))} · {u.hours.toFixed(1)}h</div>
                </div>
              ))}
              {topLawyers.length === 0 && <div className="text-sm text-slate-600">No lawyer performance yet.</div>}
            </div>
          </Card>
          <Card title="Top Interns" icon={Users}>
            <div className="space-y-3">
              {topInterns.map((u, i) => (
                <div key={u.user} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full grid place-items-center text-xs font-semibold" style={{ background: theme.surface, color: theme.primary }}>{(u.user || "U").split(" ").map((x)=>x[0]).slice(0,2).join("")}</div>
                    <div className="text-sm text-slate-800">{u.user}</div>
                  </div>
                  <div className="text-sm text-slate-700">${Intl.NumberFormat().format(Math.round(u.revenue))} · {u.hours.toFixed(1)}h</div>
                </div>
              ))}
              {topInterns.length === 0 && <div className="text-sm text-slate-600">No intern performance yet.</div>}
            </div>
          </Card>
        </div>
      </section>

      {/* Integrations strip */}
      <section className="py-8 bg-slate-50/60">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="text-xs uppercase tracking-wide text-slate-500">Works with</div>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
            {["Gmail", "PracticePanther", "Clio", "MyCase"].map((name) => (
              <div key={name} className="px-3 py-1 border rounded-full text-sm text-slate-700 bg-white/70" style={{ borderColor: theme.surface }}>{name}</div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
