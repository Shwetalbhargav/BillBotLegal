// src/pages/dashboards/InternDashboard.jsx
import React from "react";
import Sidebar from "./Sidebar";
import { MENUS } from "@/components/navigation/menus";
import CaseDashboardBase from "@/features/shared/CaseDashboardBase";
import EmailEntriesPageBase from "@/features/shared/EmailEntriesPageBase";
import useAuth from "@/hooks/useAuth";

export default function InternDashboard() {
  const { user } = useAuth();
  const role = user?.role?.toLowerCase() || "intern";

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role={role} menu={MENUS.intern} />
      <main className="flex-1 p-6 space-y-8">
        <h1 className="text-2xl font-semibold">Intern Dashboard</h1>

        <EmailEntriesPageBase role={role} />
        <CaseDashboardBase role={role} readOnly />
      </main>
    </div>
  );
}
