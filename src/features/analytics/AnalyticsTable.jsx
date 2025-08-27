import React from "react";
import DataTable from "@/components/table/DataTable";

export default function AnalyticsTable({ rows=[], loading=false, groupBy="client" }) {
  const columns = [
    { id:"bucket", header: groupBy==="client"?"Client":groupBy==="case"?"Case":groupBy==="user"?"Attorney":"Date", accessor:r=>r.bucket, width:260 },
    { id:"hours", header:"Hours", sortable:true, accessor:r=>r.hours.toFixed(1), align:"right", width:110 },
    { id:"rate", header:"Avg Rate", accessor:r=>`$${r.rate}`, align:"right", width:120 },
    { id:"revenue", header:"Revenue", sortable:true, accessor:r=>`$${r.revenue.toFixed(2)}`, align:"right", width:140 },
    { id:"loggedPct", header:"Logged %", accessor:r=>`${Math.round(r.loggedPct*100)}%`, align:"right", width:110 },
  ];
  return (
    <DataTable
      columns={columns}
      data={rows}
      total={rows.length}
      page={1}
      pageSize={rows.length || 1}
      sort={null}
      onPageChange={()=>{}}
      loading={loading}
      rowKey={(r)=>r.id}
      density="comfy"
      stickyHeader
    />
  );
}
