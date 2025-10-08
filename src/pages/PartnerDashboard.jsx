// src/pages/PartnerDashboard.jsx
import React from "react";
import Sidebar from "./Sidebar";
import { MENUS } from "@/components/navigation/menus";
import AnalyticsPageBase from "@/features/shared/AnalyticsPageBase";
import CaseDashboardBase from "@/features/shared/CaseDashboardBase";
import BillablesPageBase from "@/features/shared/BillablesPageBase";
import InvoicesPageBase from "@/features/shared/InvoicesPageBase";
import useAuth from "@/hooks/useAuth";

export default function PartnerDashboard() {
  const { user } = useAuth();
  const role = user?.role?.toLowerCase() || "partner";

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role={role} menu={MENUS.partner} />
      <main className="flex-1 p-6 space-y-8">
        <h1 className="text-2xl font-semibold">Partner Dashboard</h1>

        <AnalyticsPageBase role={role} />
        <CaseDashboardBase role={role} />
        <BillablesPageBase role={role} />
        <InvoicesPageBase role={role} />
      </main>
    </div>
  );
}
