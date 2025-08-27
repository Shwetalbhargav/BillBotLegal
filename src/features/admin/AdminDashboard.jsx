import React, { useEffect, useState } from "react";
import { Badge, Button } from "@/components/common";
import AdminUserTable from "./AdminUserTable";
import AdminDrawer from "./AdminDrawer";

// TODO: replace with real API
async function fakeFetchAdmin() {
  await new Promise(r=>setTimeout(r,150));
  return {
    users: 42,
    activeUsers: 36,
    orgs: 3,
    integrations: { practicePanther:true, clio:false, myCase:false },
    queues: { pendingPush: 7, failedPush: 2 },
  };
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(false);
  const [stats, setStats]   = useState(null);
  const [openDrawer, setOpenDrawer] = useState(null);

  useEffect(()=>{
    let m=true; setLoading(true);
    fakeFetchAdmin().then(d=>{ if(!m) return; setStats(d); setLoading(false); });
    return ()=>{ m=false; };
  },[]);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <AdminCard title="Total Users" value={stats?.users ?? "—"} loading={loading} />
        <AdminCard title="Active Users" value={stats?.activeUsers ?? "—"} loading={loading} />
        <AdminCard title="Organizations" value={stats?.orgs ?? "—"} loading={loading} />
        <AdminCard title="Pending Pushes" value={stats?.queues?.pendingPush ?? "—"} loading={loading} />
      </div>

      <div className="mt-6 p-4 border rounded-[var(--lb-radius-lg)] bg-[color:var(--lb-surface)]">
        <div className="flex items-center justify-between">
          <div className="font-semibold">Integrations</div>
          <div className="flex gap-2">
            <Badge color={stats?.integrations?.practicePanther ? "success":"danger"}>PracticePanther</Badge>
            <Badge color={stats?.integrations?.clio ? "success":"danger"}>Clio</Badge>
            <Badge color={stats?.integrations?.myCase ? "success":"danger"}>MyCase</Badge>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <div className="text-lg font-semibold">User Management</div>
        <Button variant="primary" size="sm" onClick={()=>setOpenDrawer({ id:null })}>Create User</Button>
      </div>
      <div className="mt-2">
        <AdminUserTable onEdit={(u)=>setOpenDrawer(u)} />
      </div>

      <AdminDrawer open={!!openDrawer} user={openDrawer} onClose={()=>setOpenDrawer(null)} onSave={()=>setOpenDrawer(null)} />
    </>
  );
}

function AdminCard({ title, value, loading }) {
  return (
    <div className="p-4 border rounded-[var(--lb-radius-lg)] bg-[color:var(--lb-surface)]">
      <div className="text-sm text-[color:var(--lb-muted)]">{title}</div>
      <div className="text-2xl font-semibold mt-1">{loading ? "…" : value}</div>
    </div>
  );
}
