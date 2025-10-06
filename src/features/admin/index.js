// ===============================
// File: features/admin/index.js
// ===============================
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Overview from "./Overview";
import Clients from "./Clients";
import { Cases } from "./Cases";
import Analytics from "./Analytics";
import { Invoices } from "./Invoices";
import { BillableApprovals } from "./BillableApprovals";
import AIHelper from "./AIHelper";


export default function AdminLayout(){
return (
<div className="min-h-screen bg-gray-50 text-gray-900">
<div className="flex">
<Sidebar/>
<main className="flex-1 min-h-screen">
<Routes>
<Route path="/" element={<Navigate to="/admin/overview" replace/>} />
<Route path="/overview" element={<Overview/>} />
<Route path="/clients" element={<Clients/>} />
<Route path="/cases" element={<Cases/>} />
<Route path="/analytics" element={<Analytics/>} />
<Route path="/invoices" element={<Invoices/>} />
<Route path="/approvals" element={<BillableApprovals/>} />
<Route path="/ai" element={<AIHelper/>} />
</Routes>
</main>
</div>
</div>
);
}