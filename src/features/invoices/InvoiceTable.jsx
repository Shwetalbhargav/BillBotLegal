
import React from "react";
import DataTable from "@/components/table/DataTable";
import { Badge, Button } from "@/components/common";

const Status = ({ s }) => {
  const map = {
    Draft: ["muted", "Draft"],
    Finalized: ["primary", "Finalized"],
    Sent: ["success", "Sent"],
    Paid: ["success", "Paid"],
  };
  const [color, text] = map[s] || ["muted", s || "—"];
  return <Badge color={color}>{text}</Badge>;
};

export default function InvoiceTable({
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
  onSend,
}) {
  const columns = [
    { id: "_sel", header: "", selection: true },
    { id: "client", header: "Client", sortable: true, accessor: r => r.clientName, width: 260 },
    { id: "period", header: "Period", accessor: r => (
        <span>{new Date(r.periodStart).toLocaleDateString()} – {new Date(r.periodEnd).toLocaleDateString()}</span>
      ), width: 220 },
    { id: "hours", header: "Hours", sortable: true, accessor: r => r.hours.toFixed(1), align: "right", width: 100 },
    { id: "rate", header: "Rate", accessor: r => `$${r.rate}`, align: "right", width: 100 },
    { id: "amount", header: "Amount", sortable: true, accessor: r => `$${(r.amount ?? r.hours * r.rate).toFixed(2)}`, align: "right", width: 120 },
    { id: "status", header: "Status", accessor: r => <Status s={r.status} />, width: 120 },
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
      rowActions={(r)=>(
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={()=>onEdit?.(r)}>View/Edit</Button>
          {r.status === "Draft" && (
            <Button variant="secondary" size="sm" onClick={()=>onEdit?.(r)}>Finalize</Button>
          )}
          {r.status === "Finalized" && (
            <Button variant="primary" size="sm" onClick={()=>onSend?.(r)}>Send</Button>
          )}
        </div>
      )}
    />
  );
}
