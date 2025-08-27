// Clients list using the shared DataTable pattern + UI primitives
import React from "react";
import DataTable from "@/components/table/DataTable";
import TableToolbar, { ToolbarInput, ToolbarSelect } from "@/components/table/TableToolbar";
import { Button, Badge } from "@/components/common";

/**
 * Props you can pass from the page:
 * data, total, page, pageSize, sort, selectedIds,
 * onPageChange, onPageSizeChange, onSortChange, onToggleRow, onToggleAll,
 * onEdit, onDelete, onCreate, onExport, onPushToClio
 */
export default function ClientTable({
  data = [],
  total = 0,
  page = 1,
  pageSize = 20,
  sort = null,
  selectedIds = [],
  onPageChange,
  onPageSizeChange,
  onSortChange,
  onToggleRow,
  onToggleAll,
  onEdit,
  onDelete,
  onCreate,
  onExport,
  onPushToClio,
  loading = false,
  filters = {},
  setFilters = () => {},
}) {
  const columns = [
    { id: "_sel", header: "", selection: true },
    { id: "name", header: "Name", sortable: true, accessor: (r) => r.name, filter: <ToolbarInput placeholder="Search name" value={filters.name||""} onChange={(e)=>setFilters({ ...filters, name: e.target.value })} /> },
    { id: "email", header: "Email", accessor: (r) => r.email, width: 260 },
    { id: "phone", header: "Phone", accessor: (r) => r.phone, width: 160 },
    { id: "status", header: "Status", accessor: (r) => <Badge color={r.active ? "success" : "muted"}>{r.active ? "Active" : "Paused"}</Badge>, filter: (
        <ToolbarSelect value={filters.status||""} onChange={(e)=>setFilters({ ...filters, status: e.target.value })}>
          <option value="">All</option>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
        </ToolbarSelect>
      )
    },
  ];

  return (
    <>
      <TableToolbar
        rightActions={[
          { label: "New Client", onClick: onCreate, variant: "primary" },
          { label: "Export CSV", onClick: onExport, variant: "secondary" },
        ]}
      >
        {/* Inline filters live on columns via filter slot; add global filters here if needed */}
      </TableToolbar>

      <DataTable
        columns={columns}
        data={data}
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
            <Button variant="secondary" size="sm" onClick={() => onPushToClio?.(r)}>Push to Clio</Button>
          </div>
        )}
      />
    </>
  );
}
