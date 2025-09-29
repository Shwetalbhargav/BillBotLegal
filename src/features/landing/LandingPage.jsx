import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import NavBar from "@/components/layout/NavBar";
import Footer from "@/components/layout/Footer";
import { Button, Badge } from "@/components/common";
import Loginpage from "@/assets/Loginpage.png";

// Redux slices
import { fetchBillableStats, selectBillableStats } from "@/store/analyticsSlice";
import { fetchInvoiceStats, selectInvoiceStats } from "@/store/invoiceSlice";
import { fetchEmailEntries, selectEmailEntries } from "@/store/billableSlice";
import { fetchClients, selectClients } from "@/store/clientSlice";
import { fetchUsers, selectUsers } from "@/store/usersSlice";

// Charts
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

// Icons
import { FiPieChart, FiBarChart2, FiTrendingUp, FiTable, FiMail, FiUsers, FiBriefcase } from "react-icons/fi";

// --- Small helpers
const theme = {
  primary: "#0b3b5a", // deep law‑firm navy
  accent: "#c5a156", // gold
  surface: "#0b3b5a0d", // navy @ 5%
  muted: "#6b7280",
  good: "#16a34a",
  bad: "#dc2626",
};

const COLORS = ["#2563eb", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#14b8a6"];

function toNameValueRows(raw, fallbackKey = "category", valueKey = "revenue") {
  if (!raw) return [];
  const items = Array.isArray(raw) ? raw : raw.items || raw.entries || [];
  return items.map((r, i) => ({
    id: r.id || r._id || i,
    name: r.caseTitle || r.clientName || r[fallbackKey] || `Item ${i + 1}`,
    value: Number(r[valueKey] ?? r.revenue ?? r.total ?? 0) || 0,
  }));
}

function Card({ title, icon: Icon, rightSlot, children, className = "" }) {
  return (
    <div className={`border rounded-[var(--lb-radius-lg)] bg-[color:var(--lb-bg)] shadow-[var(--lb-shadow-md)] ${className}`} style={{ borderColor: theme.surface }}>
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: theme.surface }}>
        <div className="flex items-center gap-2">
          {Icon && <Icon size={18} color={theme.primary} />}
          <h3 className="font-semibold">{title}</h3>
        </div>
        <div>{rightSlot}</div>
      </div>
      <div className="p-4">{children}</div>
    </div>
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
        <Button size="sm" variant={view === "table" ? "primary" : "secondary"} onClick={() => setView("table")}> <FiTable className="mr-1"/> Table</Button>
        <Button size="sm" variant={view === "bar" ? "primary" : "secondary"} onClick={() => setView("bar")}> <FiBarChart2 className="mr-1"/> Bar</Button>
        <Button size="sm" variant={view === "pie" ? "primary" : "secondary"} onClick={() => setView("pie")}> <FiPieChart className="mr-1"/> Pie</Button>
        <Button size="sm" variant={view === "line" ? "primary" : "secondary"} onClick={() => setView("line")}> <FiTrendingUp className="mr-1"/> Line</Button>
      </div>

      {view === "table" && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[color:var(--lb-muted)]">
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

export default function LandingPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { data: billableRaw, loading: billableLoading, error: billableError } = useSelector(selectBillableStats);
  const { data: invoiceRaw, loading: invoiceLoading } = useSelector(selectInvoiceStats);
  const { data: emails } = useSelector(selectEmailEntries);
  const { items: clients = [] } = useSelector(selectClients);
  const { items: users = [] } = useSelector(selectUsers);

  const [billablesView, setBillablesView] = useState("bar");
  const [invoicesView, setInvoicesView] = useState("table");

  useEffect(() => {
    dispatch(fetchBillableStats());
    dispatch(fetchInvoiceStats());
    dispatch(fetchEmailEntries());
    dispatch(fetchClients());
    dispatch(fetchUsers({ limit: 50 }));
  }, [dispatch]);

  const billableData = useMemo(() => toNameValueRows(billableRaw, "client", "revenue"), [billableRaw]);
  const invoiceData = useMemo(() => toNameValueRows(invoiceRaw, "client", "revenue"), [invoiceRaw]);

  return (
    <>
      <NavBar />

      <section className="pt-28 md:pt-32 pb-6">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <Badge color="primary">MVP: Email → Billable</Badge>
            <h1 className="text-3xl md:text-4xl font-semibold mt-3" style={{ color: theme.primary }}>
              Capture every billable minute — automatically.
            </h1>
            <p className="mt-3 text-[color:var(--lb-muted)]">
              We track time while you draft emails, generate clean summaries with AI,
              and push entries to practice management in one click.
            </p>
            <div className="mt-6 flex gap-3">
              <Button variant="primary" size="lg" onClick={() => navigate("/register")}>Get Started</Button>
              <Button variant="secondary" size="lg" onClick={() => navigate("/login")}>Sign in</Button>
            </div>
            <p className="mt-3 text-sm" style={{ color: theme.muted }}>No new tabs to learn. Lives inside Gmail.</p>

            {/* Live firm stats */}
            <div className="mt-6 grid grid-cols-2 gap-3 max-w-md">
              <div className="p-3 border rounded-lg flex items-center gap-2" style={{ borderColor: theme.surface }}>
                <FiUsers size={18} color={theme.primary} />
                <div>
                  <div className="text-xs" style={{ color: theme.muted }}>Lawyers</div>
                  <div className="font-semibold">{users.length}</div>
                </div>
              </div>
              <div className="p-3 border rounded-lg flex items-center gap-2" style={{ borderColor: theme.surface }}>
                <FiBriefcase size={18} color={theme.primary} />
                <div>
                  <div className="text-xs" style={{ color: theme.muted }}>Active Clients</div>
                  <div className="font-semibold">{clients.length}</div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <Card
              title="Billables by Category"
              icon={FiBarChart2}
              rightSlot={<span className="text-xs" style={{ color: theme.muted }}>demo data from your org</span>}
            >
              {billableLoading ? (
                <div className="text-sm" style={{ color: theme.muted }}>Loading…</div>
              ) : billableError ? (
                <div className="text-sm" style={{ color: theme.bad }}>{billableError}</div>
              ) : (
                <ChartSwitcher data={billableData} view={billablesView} setView={setBillablesView} />
              )}
            </Card>
          </div>
        </div>
      </section>

      <section className="py-8 bg-[color:var(--lb-surface)]/50">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-6">
          {[
            ["Real-time tracking", "Typing time is captured as you compose — pauses on inactivity."],
            ["GPT billable summaries", "Crisp, client‑friendly descriptions you can edit before logging."],
            ["One‑click push", "Send entries to PracticePanther or Clio with status feedback."],
          ].map(([title, desc]) => (
            <div key={title} className="p-5 border rounded-[var(--lb-radius-lg)] bg-[color:var(--lb-bg)]" style={{ borderColor: theme.surface }}>
              <div className="font-semibold" style={{ color: theme.primary }}>{title}</div>
              <p className="text-sm mt-2" style={{ color: theme.muted }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-8">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-6">
          <Card title="Invoice Performance" icon={FiTrendingUp}>
            {invoiceLoading ? (
              <div className="text-sm" style={{ color: theme.muted }}>Loading…</div>
            ) : (
              <ChartSwitcher data={invoiceData} view={invoicesView} setView={setInvoicesView} />
            )}
          </Card>

          <Card title="Recent Emails" icon={FiMail} rightSlot={<button className="text-xs underline" onClick={() => navigate("/emails")}>View all</button>}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[color:var(--lb-muted)]">
                    <th className="py-2 pr-4">Subject</th>
                    <th className="py-2 pr-4">Client</th>
                    <th className="py-2 pr-4">Minutes</th>
                    <th className="py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(emails || []).slice(0, 5).map((e, i) => (
                    <tr key={e._id || i} className="border-t" style={{ borderColor: theme.surface }}>
                      <td className="py-2 pr-4 truncate max-w-[220px]">{e.subject || "(no subject)"}</td>
                      <td className="py-2 pr-4">{e.clientName || "—"}</td>
                      <td className="py-2 pr-4">{e.minutes ?? 0}</td>
                      <td className="py-2">
                        <span className="px-2 py-1 text-xs rounded-full border" style={{ color: theme.good, borderColor: theme.surface, background: "#16a34a14" }}>{e.status || "Logged"}</span>
                      </td>
                    </tr>
                  ))}
                  {(!emails || emails.length === 0) && (
                    <tr>
                      <td colSpan={4} className="py-3 text-center" style={{ color: theme.muted }}>No records</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </section>

      <section className="py-8">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="text-sm" style={{ color: theme.muted }}>Works with</div>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-6">
            <div className="px-3 py-1 border rounded" style={{ borderColor: theme.surface }}>Gmail</div>
            <div className="px-3 py-1 border rounded" style={{ borderColor: theme.surface }}>Clio (soon)</div>
            <div className="px-3 py-1 border rounded" style={{ borderColor: theme.surface }}>PracticePanther</div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
