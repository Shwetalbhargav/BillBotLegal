// src/routes/AppRoutes.jsx
import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import useAuth from '@/hooks/useAuth';

// -------- Guards --------
const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

const RoleRoute = ({ children, allow = [] }) => {
  const { isAuthenticated, role } = useAuth();
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  if (allow.length && !allow.includes(role)) return <Navigate to="/dashboard" replace />;
  return children;
};

// -------- Public (features/*) --------

const Login        = lazy(() => import('@/features/auth/Login'));     
const Register     = lazy(() => import('@/features/auth/Register'));  

// -------- Protected (pages/*) --------
const ClientsPage      = lazy(() => import('@/pages/ClientsPage'));
const CasesPage        = lazy(() => import('@/pages/CasesPage'));
const BillablesPage    = lazy(() => import('@/pages/BillablesPage'));
const InvoicesPage     = lazy(() => import('@/pages/InvoicesPage'));
const AnalyticsPage    = lazy(() => import('@/pages/AnalyticsPage'));
const EmailEntriesPage = lazy(() => import('@/pages/EmailEntriesPage'));

const AdminDashboard   = lazy(() => import('@/features/admin/AdminDashboard'));
const MainDashboard    = lazy(() => import('@/pages/MainDashboard'));
const MagicOk          = lazy(() => import('@/pages/MagicOk'));
const CheckEmail       = lazy(() => import('@/pages/CheckEmail'));
const NotFound         = () => <div className="p-8 text-center">404 — Page not found</div>;
const AdminLayout = lazy(() => import('@/features/admin'));



export default function AppRoutes() {
  return (
    <Suspense fallback={<div className="min-h-screen grid place-items-center">Loading…</div>}>
      <Routes>
        {/* Public */}
        
        <Route path="/" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
        <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
        <Route path="/magic-ok" element={<MagicOk />} />
        <Route path="/check-email" element={<CheckEmail />} />

        {/* Protected */}
        <Route path="/clients" element={<PrivateRoute><ClientsPage /></PrivateRoute>} />
        <Route path="/cases" element={<PrivateRoute><CasesPage /></PrivateRoute>} />
        <Route path="/billables" element={<PrivateRoute><BillablesPage /></PrivateRoute>} />
        <Route path="/invoices" element={<PrivateRoute><InvoicesPage /></PrivateRoute>} />
        <Route path="/analytics" element={<PrivateRoute><AnalyticsPage /></PrivateRoute>} />
        <Route path="/email-entries" element={<PrivateRoute><EmailEntriesPage /></PrivateRoute>} />

        <Route path="/admin" element={<RoleRoute allow={['Admin']}><AdminDashboard /></RoleRoute>} />
        <Route path="/dashboard" element={<PrivateRoute><MainDashboard /></PrivateRoute>} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
