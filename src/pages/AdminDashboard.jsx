// ===============================
// File: src/pages/AdminDashboard.jsx
// Purpose: Page-level container that ARRANGES existing admin feature components
// without rewriting them. Uses shared layout + tabs to display everything in one place.
// ===============================
import React, { Suspense } from "react";
import Sidebar from "@/features/admin/Sidebar";
import Overview from "@/features/admin/Overview";
import Clients from "@/features/admin/Clients";
import { Cases } from "@/features/admin/Cases";
import Analytics from "@/features/admin/Analytics";
import { Invoices } from "@/features/admin/Invoices";
import { BillableApprovals } from "@/features/admin/BillableApprovals";
import AIHelper from "@/features/admin/AIHelper";

// From your shared skeleton in src/components
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"; // adjust if your tabs live elsewhere
import { Heading, Card } from "@/components/ui";
import TopBar from "@/features/admin/TopBar";
import AdminProfile from "@/features/admin/AdminProfile";

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="flex">
        <Sidebar />
        <main className="flex-1 min-h-screen">
          {/* Top navbar with avatar & profile link */}
          <TopBar />

          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Heading level={2} className="text-2xl font-semibold">Admin Dashboard</Heading>
            </div>

            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="flex flex-wrap gap-2">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="clients">Clients</TabsTrigger>
                <TabsTrigger value="cases">Cases</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="invoices">Invoices</TabsTrigger>
                <TabsTrigger value="approvals">Approvals</TabsTrigger>
                <TabsTrigger value="ai">AI Helper</TabsTrigger>
                <TabsTrigger value="profile">Profile</TabsTrigger>
              </TabsList>

              <Suspense fallback={<Card className="p-6">Loading…</Card>}>
                <TabsContent value="overview"><Overview /></TabsContent>
                <TabsContent value="clients"><Clients /></TabsContent>
                <TabsContent value="cases"><Cases /></TabsContent>
                <TabsContent value="analytics"><Analytics /></TabsContent>
                <TabsContent value="invoices"><Invoices /></TabsContent>
                <TabsContent value="approvals"><BillableApprovals /></TabsContent>
                <TabsContent value="ai"><AIHelper /></TabsContent>
                <TabsContent value="profile"><AdminProfile /></TabsContent>
              </Suspense>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
