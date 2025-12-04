// src/pages/AdminDashboard.jsx
import React from "react";
import Sidebar from "./Sidebar";
import { MENUS } from "@/components/navigation/menus";
import AnalyticsPageBase from "@/features/shared/AnalyticsPageBase";
import CaseDashboardBase from "@/features/shared/CaseDashboardBase";
import BillablesPageBase from "@/features/shared/BillablesPageBase";
import InvoicesPageBase from "@/features/shared/InvoicesPageBase";
import useAuth from "@/hooks/useAuth";
import adminImg from "@/assets/admin.jpg";   

export default function AdminDashboard() {
  const { user } = useAuth();
  const role = user?.role?.toLowerCase() || "admin";

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role={role} menu={MENUS.admin} />

      <main className="flex-1 p-6 space-y-8">
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Admin Dashboard</h1>

          {/* Profile image */}
          <img
            src={adminImg}
            alt="Admin"
            className="h-12 w-12 rounded-full shadow-md object-cover border border-gray-300"
          />
        </div>

        {/* Existing dashboard widgets */}
        <AnalyticsPageBase role={role} />
        <CaseDashboardBase role={role} />
        <BillablesPageBase role={role} />
        <InvoicesPageBase role={role} />
      </main>
    </div>
  );
}
