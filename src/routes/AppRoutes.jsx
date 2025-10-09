// src/routes/AppRoutes.jsx
import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import useAuth from "@/hooks/useAuth";

// Layouts
import ProtectedLayout from "@/layouts/ProtectedLayout";
import PublicLayout from "@/layouts/PublicLayout";

/* -------------------------------- Public -------------------------------- */
const Login = lazy(() => import("@/features/auth/Login"));
const Register = lazy(() => import("@/features/auth/Register"));
const MagicOk = lazy(() => import("@/pages/MagicOk"));
const CheckEmail = lazy(() => import("@/pages/CheckEmail"));

/* ------------------------------- Dashboards ------------------------------ */
const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"));
const PartnerDashboard = lazy(() => import("@/pages/PartnerDashboard"));
const LawyerDashboard = lazy(() => import("@/pages/LawyerDashboard"));
const AssociateDashboard = lazy(() => import("@/pages/AssociateDashboard"));
const InternDashboard = lazy(() => import("@/pages/InternDashboard"));

/* ------------------------------- Shared Pages ---------------------------- */
const ClientsPage = lazy(() => import("@/pages/ClientsPage"));
const CasesPage = lazy(() => import("@/pages/CasesPage"));
const BillablesPage = lazy(() => import("@/pages/BillablesPage"));
const InvoicesPage = lazy(() => import("@/pages/InvoicesPage"));
const AnalyticsPage = lazy(() => import("@/pages/AnalyticsPage"));
const EmailEntriesPage = lazy(() => import("@/pages/EmailEntriesPage"));
const MainDashboard = lazy(() => import("@/pages/MainDashboard"));

/* ------------------------------- Utilities ------------------------------ */
const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center text-gray-600 text-lg">
    404 – Page Not Found
  </div>
);

/* --------------------------- Helper: Role Routing ----------------------- */
const getRoleDashboard = (role) => {
  switch ((role || "").toLowerCase()) {
    case "admin":
      return "/admin/dashboard";
    case "partner":
      return "/partner/dashboard";
    case "lawyer":
      return "/lawyer/dashboard";
    case "associate":
      return "/associate/dashboard";
    case "intern":
      return "/intern/dashboard";
    default:
      return "/login";
  }
};

/* ------------------------------ Guards ---------------------------------- */
const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, role } = useAuth();
  return isAuthenticated ? (
    <Navigate to={getRoleDashboard(role)} replace />
  ) : (
    children
  );
};

const RoleRoute = ({ children, allow }) => {
  const { isAuthenticated, role } = useAuth();
  const userRole = (role || "").toLowerCase();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allow && !allow.includes(userRole))
    return <Navigate to={getRoleDashboard(userRole)} replace />;
  return children;
};

/* ------------------------------ App Routes ------------------------------ */
export default function AppRoutes() {
  const { role } = useAuth();

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-gray-500">
          Loading…
        </div>
      }
    >
      <Routes>
        {/* ------------------ Public Routes ------------------ */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<PublicOnlyRoute><Navigate to="/login" replace /></PublicOnlyRoute>}/>
          <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>}/>
          <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>}/>
          <Route path="/magic-ok" element={<MagicOk />} />
          <Route path="/check-email" element={<CheckEmail />} />
        </Route>

        {/* ---------------- Protected Routes ---------------- */}
        <Route element={<ProtectedLayout />}>
          {/* Redirect generic /dashboard → role-specific dashboard */}
          <Route path="/dashboard" element={<PrivateRoute><Navigate to={getRoleDashboard(role)} replace /></PrivateRoute>}/>

          {/* ---- Role Dashboards ---- */}
          <Route  path="/admin/dashboard" element={<RoleRoute allow={["admin"]}><AdminDashboard /></RoleRoute> }/>

          <Route path="/partner/dashboard" element={<RoleRoute allow={["partner", "admin"]}><PartnerDashboard /></RoleRoute>}/>
          <Route path="/lawyer/dashboard"element={<RoleRoute allow={["lawyer", "partner", "admin"]}><LawyerDashboard /></RoleRoute>} />
          <Route path="/associate/dashboard" element={<RoleRoute allow={["associate", "partner", "admin"]}><AssociateDashboard /></RoleRoute> } />
          <Route path="/intern/dashboard" element={ <RoleRoute allow={["intern", "admin"]}> <InternDashboard /> </RoleRoute> } />

          {/* ---- Shared Feature Pages ---- */}
          <Route path="/clients" element={ <PrivateRoute> <ClientsPage /> </PrivateRoute> } />
          <Route path="/cases" element={ <PrivateRoute> <CasesPage /></PrivateRoute> } />
          <Route path="/billables" element={ <PrivateRoute> <BillablesPage /> </PrivateRoute>} />
          <Route path="/invoices" element={ <PrivateRoute> <InvoicesPage /> </PrivateRoute> } />
          <Route path="/analytics" element={ <PrivateRoute> <AnalyticsPage /> </PrivateRoute> } />
          <Route path="/email-entries"element={ <PrivateRoute> <EmailEntriesPage /> </PrivateRoute> } />
          <Route path="/main-dashboard" element={<PrivateRoute><MainDashboard /></PrivateRoute>}/></Route>

        {/* ----------------- 404 Fallback ----------------- */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
