import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchAnalytics } from "@/store/analyticsSlice";
import { fetchCases } from "@/store/caseSlice";
import { fetchClientsThunk } from "@/store/clientSlice";
import { fetchInvoices } from "@/store/invoiceSlice";
import { fetchBillables } from "@/store/billableSlice";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import useAuth from "@/hooks/useAuth";
import { getDefaultRouteForRole } from "@/components/navigation/menus";

export default function MainDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const role = useMemo(() => user?.role?.toLowerCase() || "lawyer", [user]);

  const { billable, invoice, unbilled, loading } = useSelector((s) => s.analytics);
  const cases = useSelector((s) => s.cases.list);
  const clients = useSelector((s) => s.clients.list);
  const invoices = useSelector((s) => s.invoices.list);

  // Fetch summary data once
  useEffect(() => {
    dispatch(fetchAnalytics());
    dispatch(fetchCases());
    dispatch(fetchClientsThunk());
    dispatch(fetchInvoices());
    dispatch(fetchBillables());
  }, [dispatch]);

  // Redirect unauthenticated users
  useEffect(() => {
    if (!isAuthenticated) navigate("/login", { replace: true });
  }, [isAuthenticated, navigate]);

  // Optional: redirect to role-based overview if user manually lands on a different base route
  useEffect(() => {
    const base = `/${role}`;
    if (window.location.pathname === base || window.location.pathname === `${base}/`) {
      navigate(getDefaultRouteForRole(role), { replace: true });
    }
  }, [role, navigate]);

  // --- Derived data
  const totalRevenue = useMemo(
    () => invoice?.entries?.reduce((a, r) => a + (r.revenue || 0), 0),
    [invoice?.entries]
  );
  const totalBillable = useMemo(
    () => billable?.entries?.reduce((a, r) => a + (r.revenue || 0), 0),
    [billable?.entries]
  );

  // Role-based visibility rules
  const showAnalytics = ["admin", "partner"].includes(role);
  const showClients = ["admin", "partner", "lawyer"].includes(role);
  const showInvoices = ["admin", "partner"].includes(role);
  const showBillables = ["admin", "partner", "lawyer", "associate"].includes(role);
  const showCases = ["admin", "partner", "lawyer", "associate", "intern"].includes(role);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Welcome, {user?.name || "User"}!</h2>
      <p className="text-sm text-gray-500">Role: {role.toUpperCase()}</p>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {showInvoices && (
          <StatCard title="Total Revenue" value={`$${(totalRevenue || 0).toFixed(2)}`} />
        )}
        {showBillables && (
          <StatCard title="Billable Value" value={`$${(totalBillable || 0).toFixed(2)}`} />
        )}
        {showCases && <StatCard title="Active Cases" value={cases?.length || 0} />}
        {showClients && <StatCard title="Clients" value={clients?.length || 0} />}
      </div>

      {/* Analytics Charts */}
      {showAnalytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard
            title="Revenue Trend"
            data={invoice.entries.slice(0, 10)}
            dataKey="revenue"
            color="#4f46e5"
          />
          <ChartCard
            title="Billables (Top 10)"
            data={billable.entries.slice(0, 10)}
            dataKey="hours"
            color="#16a34a"
          />
        </div>
      )}

      {/* Optional: role-specific summaries */}
      {role === "intern" && (
        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-gray-700 text-sm">
            You can view your assigned tasks and case notes under <strong>Tasks / Entries</strong>.
          </p>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="bg-white rounded-xl shadow p-6 flex flex-col justify-between">
      <span className="text-sm text-gray-500">{title}</span>
      <span className="text-2xl font-bold text-indigo-600">{value}</span>
    </div>
  );
}

function ChartCard({ title, data, dataKey, color }) {
  return (
    <div className="bg-white rounded-xl shadow p-4">
      <h3 className="text-lg font-semibold mb-3">{title}</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} />
            <CartesianGrid stroke="#e5e7eb" />
            <XAxis dataKey="client" hide />
            <YAxis />
            <Tooltip />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
