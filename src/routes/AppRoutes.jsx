// src/routes/AppRoutes.jsx
import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import useAuth from "@/hooks/useAuth";

import ProtectedLayout from "@/layouts/ProtectedLayout";
import PublicLayout from "@/layouts/PublicLayout";

const Login = lazy(() => import("@/features/auth/Login"));
const Register = lazy(() => import("@/features/auth/Register"));
const MagicOk = lazy(() => import("@/pages/MagicOk"));
const CheckEmail = lazy(() => import("@/pages/CheckEmail"));
const Landing = lazy(() => import("@/pages/LandingPage"));

const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"));
const PartnerDashboard = lazy(() => import("@/pages/PartnerDashboard"));
const LawyerDashboard = lazy(() => import("@/pages/LawyerDashboard"));
const AssociateDashboard = lazy(() => import("@/pages/AssociateDashboard"));
const InternDashboard = lazy(() => import("@/pages/InternDashboard"));

const ClientsPage = lazy(() => import("@/pages/ClientsPage"));
const CasesPage = lazy(() => import("@/pages/CasesPage"));
const BillablesPage = lazy(() => import("@/pages/BillablesPage"));
const InvoicesPage = lazy(() => import("@/pages/InvoicesPage"));
const AnalyticsPage = lazy(() => import("@/pages/AnalyticsPage"));
const EmailEntriesPage = lazy(() => import("@/pages/EmailEntriesPage"));

const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center text-gray-600 text-lg">
    404 - Page Not Found
  </div>
);

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
  if (allow?.length && !allow.includes(userRole)) {
    return <Navigate to={getRoleDashboard(userRole)} replace />;
  }
  return children;
};

export default function AppRoutes() {
  const { role } = useAuth();

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-gray-500">
          Loading...
        </div>
      }
    >
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/Landing" element={<Navigate to="/" replace />} />
          <Route path="/landing" element={<Navigate to="/" replace />} />
          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <Login />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicOnlyRoute>
                <Register />
              </PublicOnlyRoute>
            }
          />
          <Route path="/magic-ok" element={<MagicOk />} />
          <Route path="/check-email" element={<CheckEmail />} />
        </Route>

        <Route element={<ProtectedLayout />}>
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Navigate to={getRoleDashboard(role)} replace />
              </PrivateRoute>
            }
          />

          <Route
            path="/admin/dashboard"
            element={
              <RoleRoute allow={["admin"]}>
                <AdminDashboard />
              </RoleRoute>
            }
          />
          <Route
            path="/partner/dashboard"
            element={
              <RoleRoute allow={["partner", "admin"]}>
                <PartnerDashboard />
              </RoleRoute>
            }
          />
          <Route
            path="/lawyer/dashboard"
            element={
              <RoleRoute allow={["lawyer", "partner", "admin"]}>
                <LawyerDashboard />
              </RoleRoute>
            }
          />
          <Route
            path="/associate/dashboard"
            element={
              <RoleRoute allow={["associate", "partner", "admin"]}>
                <AssociateDashboard />
              </RoleRoute>
            }
          />
          <Route
            path="/intern/dashboard"
            element={
              <RoleRoute allow={["intern", "admin"]}>
                <InternDashboard />
              </RoleRoute>
            }
          />

          <Route
            path="/clients"
            element={
              <RoleRoute allow={["admin", "partner", "lawyer"]}>
                <ClientsPage />
              </RoleRoute>
            }
          />
          <Route
            path="/cases"
            element={
              <RoleRoute allow={["admin", "partner", "lawyer", "associate", "intern"]}>
                <CasesPage />
              </RoleRoute>
            }
          />
          <Route
            path="/billables"
            element={
              <RoleRoute allow={["admin", "partner", "lawyer", "associate"]}>
                <BillablesPage />
              </RoleRoute>
            }
          />
          <Route
            path="/invoices"
            element={
              <RoleRoute allow={["admin", "partner", "lawyer"]}>
                <InvoicesPage />
              </RoleRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <RoleRoute allow={["admin", "partner"]}>
                <AnalyticsPage />
              </RoleRoute>
            }
          />
          <Route
            path="/email-entries"
            element={
              <RoleRoute allow={["admin", "partner", "lawyer", "associate", "intern"]}>
                <EmailEntriesPage />
              </RoleRoute>
            }
          />
          <Route
            path="/profile/*"
            element={
              <PrivateRoute>
                <Navigate to={getRoleDashboard(role)} replace />
              </PrivateRoute>
            }
          />
          <Route
            path="/main-dashboard"
            element={
              <PrivateRoute>
                <Navigate to="/dashboard" replace />
              </PrivateRoute>
            }
          />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
