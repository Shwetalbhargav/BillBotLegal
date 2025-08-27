// Cases list using the shared DataTable pattern + UI primitives
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
export default function CaseTable({
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
    { id: "title", header: "Title", sortable: true, accessor: (r) => r.title, filter: <ToolbarInput placeholder="Search title" value={filters.title||""} onChange={(e)=>setFilters({ ...filters, title: e.target.value })} /> },
    { id: "description", header: "Description", accessor: (r) => r.description, width: 360 },
    { id: "client", header: "Client", accessor: (r) => r.clientName || r.clientId, width: 220, filter: <ToolbarInput placeholder="Client…" value={filters.client||""} onChange={(e)=>setFilters({ ...filters, client: e.target.value })} /> },
    { id: "status", header: "Status", accessor: (r) => <Badge color={r.status === "Open" ? "primary" : r.status === "Closed" ? "muted" : "success"}>{r.status || "Open"}</Badge>, sortable: true,
      filter: (
        <ToolbarSelect value={filters.status||""} onChange={(e)=>setFilters({ ...filters, status: e.target.value })}>
          <option value="">All</option>
          <option>Open</option>
          <option>In Progress</option>
          <option>Closed</option>
        </ToolbarSelect>
      )
    },
  ];

  return (
    <>
      <TableToolbar
        rightActions={[
          { label: "New Case", onClick: onCreate, variant: "primary" },
          { label: "Export CSV", onClick: onExport, variant: "secondary" },
        ]}
      />
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
