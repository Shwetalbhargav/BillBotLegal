import React from "react";
import DataTable from "@/components/table/DataTable";
import { Badge, Button } from "@/components/common";

const RoleBadge = ({ role }) => {
  const map = { Admin:"primary", Attorney:"success", Paralegal:"muted", Billing:"secondary" };
  return <Badge color={map[role] || "muted"}>{role}</Badge>;
};
const StatusBadge = ({ status }) => {
  const map = { Active:"success", Invited:"primary", Suspended:"danger" };
  return <Badge color={map[status] || "muted"}>{status}</Badge>;
};

export default function TeamTable({
  data=[], total=0, page=1, pageSize=20, loading=false,
  onPageChange, onPageSizeChange, onEdit, onSuspend
}) {
  const columns = [
    { id:"name", header:"Name", accessor:r=>r.name, width:220 },
    { id:"email", header:"Email", accessor:r=>r.email, width:260 },
    { id:"role", header:"Role", accessor:r=><RoleBadge role={r.role} />, width:120 },
    { id:"status", header:"Status", accessor:r=><StatusBadge status={r.status} />, width:120 },
    { id:"clients", header:"Clients", accessor:r=>r.clients?.join(", ") || "—", width:260 },
    { id:"cases", header:"Cases", accessor:r=>r.cases?.join(", ") || "—", width:240 },
  ];
  return (
    <DataTable
      columns={columns}
      data={data}
      total={total}
      page={page}
      pageSize={pageSize}
      sort={null}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      rowKey={(r)=>r.id}
      loading={loading}
      rowActions={(r)=>(
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={()=>onEdit?.(r)}>Edit</Button>
          <Button variant="danger" size="sm" onClick={()=>onSuspend?.(r.id)}>{r.status==="Suspended"?"Unsuspend":"Suspend"}</Button>
        </div>
      )}
    />
  );
}
