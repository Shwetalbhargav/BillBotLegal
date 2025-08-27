// CaseTable.jsx
import React from "react";
import DataTable from "@/components/table/DataTable";
import { Button, Badge } from "@/components/common";

const StatusBadge = ({ status }) => {
  const map = {
    open: ["primary", "Open"],
    pending: ["warning", "Pending"],
    closed: ["muted", "Closed"],
  };
  const [color, text] = map[status] || ["muted", status || "—"];
  return <Badge color={color}>{text}</Badge>;
};

export default function CaseTable({
  cases = [],
  total = 0,           // optional if your DataTable uses it
  page = 1,
  pageSize = 20,
  sort = null,
  loading = false,
  selectedIds = [],
  onPageChange,
  onPageSizeChange,
  onSortChange,
  onToggleRow,
  onToggleAll,
  onEdit,
  onDelete,
}) {
  const columns = [
    { id: "_sel", header: "", selection: true },
    { id: "name", header: "Name", sortable: true, accessor: (r) => r.name, width: 240 },
    { id: "clientId", header: "Client", accessor: (r) => r.clientId, width: 220 },
    { id: "status", header: "Status", sortable: true, accessor: (r) => <StatusBadge status={r.status} />, width: 140 },
    { id: "createdAt", header: "Created", sortable: true, accessor: (r) => (r.createdAt ? new Date(r.createdAt).toLocaleString() : "—"), width: 180 },
    { id: "assignedUsers", header: "Assigned Users", accessor: (r) => Array.isArray(r.assignedUsers) ? r.assignedUsers.length : 0, width: 140 },
    { id: "primaryLawyerId", header: "Primary Lawyer", accessor: (r) => r.primaryLawyerId || "—", width: 180 },
    { id: "description", header: "Description", accessor: (r) => r.description || "—", width: 360 },
  ];

  return (
    <DataTable
      columns={columns}
      data={cases}
      total={total}
      page={page}
      pageSize={pageSize}
      sort={sort}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      onSortChange={onSortChange}
      selectedIds={selectedIds}
      onToggleRow={onToggleRow}
      onToggleAll={onToggleAll}
      rowKey={(r) => r._id}
      loading={loading}
      density="comfy"
      stickyHeader
      rowActions={(r) => (
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => onEdit?.(r)}>Edit</Button>
          <Button variant="danger" size="sm" onClick={() => onDelete?.(r._id)}>Delete</Button>
        </div>
      )}
    />
  );
}
