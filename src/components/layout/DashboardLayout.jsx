// DashboardLayout.jsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import NavBar from "@/components/layout/NavBar";
import Footer from "@/components/layout/Footer";
import Sidebar from "@/components/navigation/Sidebar";
import { MENUS, getDefaultRouteForRole } from "@/components/navigation/menus";
import useAuth from "@/hooks/useAuth";

// simple UI context so nested components can read/toggle collapsed state if needed
const DashboardUIContext = createContext(null);
export const useDashboardUI = () => useContext(DashboardUIContext);

export default function DashboardLayout({ role: roleProp }) {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // role priority: explicit prop > authed user role > 'lawyer' (sane default)
  const role = (roleProp || user?.role || "lawyer")?.toLowerCase();

  // persist collapse between visits
  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem("sidebar:collapsed");
    return saved ? saved === "1" : false;
  });
  useEffect(() => {
    localStorage.setItem("sidebar:collapsed", collapsed ? "1" : "0");
  }, [collapsed]);

  // this layout is only for authenticated areas
  useEffect(() => {
    if (!isAuthenticated) navigate("/login");
  }, [isAuthenticated, navigate]);

  const menu = MENUS[role] ?? MENUS.lawyer;
  const ctx = useMemo(() => ({ collapsed, setCollapsed, role }), [collapsed, role]);

  // If user hits the bare base path (/partner, /lawyer, etc.), redirect to their default overview route
  useEffect(() => {
    const base = `/${role}`;
    if (location.pathname === base || location.pathname === `${base}/`) {
      navigate(getDefaultRouteForRole(role), { replace: true });
    }
  }, [location.pathname, role, navigate]);

  return (
    <DashboardUIContext.Provider value={ctx}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
        <NavBar />

        {/* Shell */}
        <div className="pt-20 flex">
          {/* Sidebar */}
          <Sidebar items={menu} collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />

          {/* Main content area */}
          <main
            className={`flex-1 transition-[margin] ${
              collapsed ? "ml-16" : "ml-64"
            } px-4 sm:px-6 lg:px-8`}
          >
            <div className="mx-auto max-w-7xl py-6">
              <Outlet />
            </div>
            <Footer className="mt-10" showNewsletter={false} />
          </main>
        </div>
      </div>
    </DashboardUIContext.Provider>
  );
}
