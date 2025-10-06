// ===============================
// File: features/admin/Analytics.jsx
// ===============================
import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAnalytics } from "@/store/analyticsSlice";
import { Card, Heading, Loader, EmptyState, Badge } from "@/components/ui";


function Stat({ label, value, hint }){
return (
<div className="p-4 rounded-2xl bg-white shadow-sm border flex flex-col gap-1">
<div className="text-sm text-gray-500">{label}</div>
<div className="text-2xl font-semibold">{value}</div>
{hint && <div className="text-xs text-gray-400">{hint}</div>}
</div>
);
}

function DataTable({ rows, columns }){
if (!rows?.length) return (
<div className="p-8"><EmptyState title="No data" description="Once entries are logged, analytics will appear here."/></div>
);
return (
<div className="overflow-x-auto">
<table className="min-w-full divide-y divide-gray-200">
<thead className="bg-gray-50">
<tr>
{columns.map((c)=> (
<th key={c.key} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">{c.label}</th>
))}
</tr>
</thead>
<tbody className="bg-white divide-y divide-gray-100">
{rows.map((r)=> (
<tr key={r.id} className="hover:bg-gray-50">
{columns.map((c)=> (
<td key={c.key} className="px-4 py-3 whitespace-nowrap">{c.render? c.render(r[c.key], r) : r[c.key]}</td>
))}
</tr>
))}
</tbody>
</table>
</div>
);
}

export default function Analytics(){
const dispatch = useDispatch();
const { billable, invoice, unbilled, loading, error } = useSelector(s => s.analytics || { billable:{entries:[]}, invoice:{entries:[]}, unbilled:{entries:[]}, loading:false, error:null });


useEffect(()=>{ dispatch(fetchAnalytics()); },[dispatch]);


const totals = useMemo(()=>{
const sum = (arr, k)=> (arr||[]).reduce((a,b)=> a + Number(b?.[k]||0), 0);
const hours = sum(billable.entries, 'hours');
const revenue = sum(billable.entries, 'revenue');
const invRevenue = sum(invoice.entries, 'revenue');
const unbilledRev = sum(unbilled.entries, 'revenue');
return { hours, revenue, invRevenue, unbilledRev };
},[billable, invoice, unbilled]);

const columns = [
{ key: 'date', label: 'Date' },
{ key: 'client', label: 'Client' },
{ key: 'case', label: 'Case' },
{ key: 'user', label: 'User' },
{ key: 'hours', label: 'Hours' },
{ key: 'rate', label: 'Rate' },
{ key: 'revenue', label: 'Value' },
];


return (
<div className="p-6 space-y-6">
<div className="flex items-center justify-between">
<Heading level={2} className="text-2xl font-semibold">Analytics</Heading>
{loading && <Loader/>}
</div>

{error && <div className="text-sm text-red-600">{error}</div>}


<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
<Stat label="Total Billable Hours" value={totals.hours.toFixed(2)} />
<Stat label="Billable Value" value={`$${totals.revenue.toFixed(2)}`} />
<Stat label="Invoiced Revenue" value={`$${totals.invRevenue.toFixed(2)}`} />
<Stat label="Unbilled Value" value={`$${totals.unbilledRev.toFixed(2)}`} />
</div>


<Card className="p-0 overflow-hidden">
<div className="px-4 py-3 flex items-center gap-2 border-b">
<Heading level={3} className="text-lg font-semibold">Billable Entries</Heading>
<Badge>Last 90 days</Badge>
</div>
<DataTable rows={billable.entries} columns={columns} />
</Card>


<Card className="p-0 overflow-hidden">
<div className="px-4 py-3 flex items-center gap-2 border-b">
<Heading level={3} className="text-lg font-semibold">Invoiced</Heading>
</div>
<DataTable rows={invoice.entries} columns={columns} />
</Card>


<Card className="p-0 overflow-hidden">
<div className="px-4 py-3 flex items-center gap-2 border-b">
<Heading level={3} className="text-lg font-semibold">Unbilled</Heading>
</div>
<DataTable rows={unbilled.entries} columns={columns} />
</Card>
</div>
);
}