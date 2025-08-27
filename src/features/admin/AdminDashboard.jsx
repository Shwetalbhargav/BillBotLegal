// src/features/admin/AdminDashboard.jsx
import React, { useState, useMemo } from "react";
import { DataTable, SkeletonRows, TableToolbar } from "@/components/table";
import { Button, Drawer, ConfirmDialog, useToast, Badge } from "@/components/common";

// NOTE: No AdminUserTable/AdminDrawer imports — per your request.

export default function AdminDashboard() {
  const toast = useToast?.();

  // local state (stubbed)
  const [openDrawer, setOpenDrawer] = useState(false);
  const [confirmId, setConfirmId] = useState(null);

  // skeleton table columns
  const columns = useMemo(
    () => [
      { id: "name", header: "Name", accessor: (r) => r.name, width: 220, sortable: true },
      { id: "email", header: "Email", accessor: (r) => r.email, width: 260 },
      { id: "role", header: "Role", accessor: (r) => <Badge>{r.role || "—"}</Badge>, width: 120 },
      {
        id: "act",
        header: "",
        accessor: () => (
          <div className="flex justify-end">
            <Button variant="ghost" size="sm" disabled>
              Edit
            </Button>
          </div>
        ),
        width: 80,
      },
    ],
    []
  );

  // no real data — render skeletons only
  const data = useMemo(() => [], []);

  return (
    <div className="lb-reset p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Admin</h1>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => toast?.addToast?.({ title: "Refreshed", description: "Placeholder" })}>
            Refresh
          </Button>
          <Button onClick={() => setOpenDrawer(true)}>New User</Button>
        </div>
      </div>

      <TableToolbar>
        <div className="text-sm text-gray-500">User management (skeleton)</div>
      </TableToolbar>

      <DataTable
        columns={columns}
        data={data}
        loading
        skeleton={<SkeletonRows columns={columns} rows={8} />}
        rowKey={(_, i) => i}
      />

      {/* Inline Drawer (skeleton form) */}
      <Drawer open={openDrawer} onClose={() => setOpenDrawer(false)} title="User">
        <div className="space-y-3">
          <SkeletonLine />
          <SkeletonLine />
          <SkeletonLine wide />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setOpenDrawer(false)}>
              Cancel
            </Button>
            <Button disabled>Save</Button>
          </div>
        </div>
      </Drawer>

      {/* Inline Confirm (skeleton) */}
      <ConfirmDialog
        open={!!confirmId}
        onCancel={() => setConfirmId(null)}
        onConfirm={() => {
          setConfirmId(null);
          toast?.addToast?.({ tone: "success", title: "Deleted", description: "Placeholder only" });
        }}
        title="Delete this user?"
        description="This action cannot be undone."
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}

function SkeletonLine({ wide }) {
  return (
    <div
      className={`h-9 rounded-lg bg-gray-100 animate-pulse ${
        wide ? "w-full" : "w-1/2"
      }`}
    />
  );
}
