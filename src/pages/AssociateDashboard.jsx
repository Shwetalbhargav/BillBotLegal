// src/pages/dashboards/AssociateDashboard.jsx
import React from "react";
import Sidebar from "./Sidebar";
import { MENUS } from "@/components/navigation/menus";
import CaseDashboardBase from "@/features/shared/CaseDashboardBase";
import BillablesPageBase from "@/features/shared/BillablesPageBase";
import useAuth from "@/hooks/useAuth";

export default function AssociateDashboard() {
  const { user } = useAuth();
  const role = user?.role?.toLowerCase() || "associate";

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role={role} menu={MENUS.associate} />
      <main className="flex-1 p-6 space-y-8">
        <h1 className="text-2xl font-semibold">Associate Dashboard</h1>

        <CaseDashboardBase role={role} />
        <BillablesPageBase role={role} />
      </main>
    </div>
  );
}
