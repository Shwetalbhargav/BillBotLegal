// src/pages/dashboards/LawyerDashboard.jsx
import React from "react";
import Sidebar from "./Sidebar";
import { MENUS } from "@/components/navigation/menus";
import CaseDashboardBase from "@/pages/shared/CaseDashboardBase";
import BillablesPageBase from "@/pages/shared/BillablesPageBase";
import ClientDashboardBase from "@/pages/shared/ClientDashboardBase";
import InvoicesPageBase from "@/pages/shared/InvoicesPageBase";
import useAuth from "@/hooks/useAuth";

export default function LawyerDashboard() {
  const { user } = useAuth();
  const role = user?.role?.toLowerCase() || "lawyer";

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role={role} menu={MENUS.lawyer} />
      <main className="flex-1 p-6 space-y-8">
        <h1 className="text-2xl font-semibold">Lawyer Dashboard</h1>

        <CaseDashboardBase role={role} />
        <BillablesPageBase role={role} />
        <ClientDashboardBase role={role} readOnly />
        <InvoicesPageBase role={role} readOnly />
      </main>
    </div>
  );
}
