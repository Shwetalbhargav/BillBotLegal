import React from "react";
import { Navigate } from "react-router-dom";
import useAuth from "@/hooks/useAuth";

export const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

export const RoleRoute = ({ children, allow = [] }) => {
  const { isAuthenticated, role } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allow.length && !allow.includes(role)) return <Navigate to="/forbidden" replace />;
  return children;
};
