import React, { useEffect, useState } from "react";
import DataTable from "@/components/table/DataTable";
import { Button, Badge } from "@/components/common";

// TODO: replace with real API
async function fakeFetchUsers({ page, pageSize }) {
  await new Promise(r=>setTimeout(r,160));
  const roles = ["Admin","Attorney","Paralegal","Billing"];
  const statuses = ["Active","Invited","Suspended"];
  const data = Array.from({ length: pageSize }).map((_,i)=>({
    id:`admin-${page}-${i}`, name:`User ${i}`, email:`user${i}@firm.com`,
    role: roles[i%roles.length], status: statuses[i%statuses.length],
  }));
  return { data, total: 97 };
}

export default function AdminUserTable({ onEdit }) {
  const [page, setPage] = useState(1), [pageSize, setPageSize] = useState(20);
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]), [total, setTotal] = useState(0);

  useEffect(()=>{
    let m=true; setLoading(true);
    fakeFetchUsers({ page, pageSize }).then(({ data, total })=>{
      if (!m) return; setRows(data); setTotal(total); setLoading(false);
    });
    return ()=>{ m=false; };
  }, [page, pageSize]);

  const Role = ({ r }) => <Badge color={{Admin:"primary",Attorney:"success",Paralegal:"muted",Billing:"secondary"}[r] || "muted"}>{r}</Badge>;
  const Status = ({ s }) => <Badge color={{Active:"success",Invited:"primary",Suspended:"danger"}[s] || "muted"}>{s}</Badge>;

  const cols = [
    { id:"name", header:"Name", accessor:r=>r.name, width:220 },
    { id:"email", header:"Email", accessor:r=>r.email, width:260 },
    { id:"role", header:"Role", accessor:r=><Role r={r.role} />, width:120 },
    { id:"status", header:"Status", accessor:r=><Status s={r.status} />, width:120 },
  ];

  return (
    <DataTable
      columns={cols}
      data={rows}
      total={total}
      page={page}
      pageSize={pageSize}
      sort={null}
      onPageChange={setPage}
      onPageSizeChange={setPageSize}
      rowKey={(r)=>r.id}
      loading={loading}
      rowActions={(r)=>(
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={()=>onEdit?.(r)}>Edit</Button>
        </div>
      )}
    />
  );
}
