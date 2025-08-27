import React from "react";
import DataTable from "@/components/table/DataTable";
import { Badge, Button } from "@/components/common";

const StatusBadge = ({ status }) => {
  const map = {
    Pending: ["primary", "Pending"],
    Logged: ["success", "Logged"],
    Failed: ["danger", "Failed"],
  };
  const [color, text] = map[status] || ["muted", status || "—"];
  return <Badge color={color}>{text}</Badge>;
};

export default function BillablesTable({
  data = [],
  total = 0,
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
  onPushToClio,
}) {
  const columns = [
    { id: "_sel", header: "", selection: true },
    { id: "subject", header: "Subject", sortable: true, accessor: r => r.subject, width: 360 },
    { id: "client", header: "Client", accessor: r => r.clientName, width: 200 },
    { id: "case", header: "Case", accessor: r => r.caseName, width: 220 },
    { id: "hours", header: "Hours", sortable: true, accessor: r => r.hours?.toFixed?.(1) ?? r.hours, align: "right", width: 90 },
    { id: "date", header: "Date", sortable: true, accessor: r => new Date(r.date).toLocaleString(), width: 200 },
    { id: "status", header: "Status", accessor: r => <StatusBadge status={r.status} />, width: 120 },
  ];

  return (
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
      rowKey={(r)=>r.id}
      loading={loading}
      density="comfy"
      stickyHeader
      rowActions={(r)=>(
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={()=>onEdit?.(r)}>Edit</Button>
          <Button variant="secondary" size="sm" onClick={()=>onPushToClio?.(r)}>Push to Clio</Button>
          {r.status === "Failed" && (
            <Button variant="danger" size="sm" onClick={()=>onPushToClio?.(r)}>Retry</Button>
          )}
        </div>
      )}
    />
  );
}
