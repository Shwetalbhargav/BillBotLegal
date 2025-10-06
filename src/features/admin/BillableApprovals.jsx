// ===============================
// File: features/admin/BillableApprovals.jsx
// ===============================
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchBillables, editBillable, removeBillable } from "@/store/billableSlice";
import { Button, Card, Heading, Loader, EmptyState, ConfirmDialog, ToastProvider, useToast } from "@/components/ui";


export function BillableApprovals(){
const dispatch = useDispatch();
const { list, loading, error } = useSelector(s => s.billables || { list: [], loading: false, error: null });
const [confirm, setConfirm] = useState(null);
const { pushToast } = useToast?.() || { pushToast: () => {} };


useEffect(()=>{ dispatch(fetchBillables()); },[dispatch]);


const rows = useMemo(()=> (list||[]).sort((a,b)=> (b.date||'').localeCompare(a.date||'')),[list]);
const approve = async (row)=>{
try {
await dispatch(editBillable({ id: row._id, billable: { status: 'Approved' } })).unwrap();
pushToast?.({ title: 'Approved', description: row.description || row.task || 'Billable approved' });
} catch (e) { pushToast?.({ title: 'Error', description: e.message, variant: 'destructive' }); }
};
const reject = async (row)=>{
try {
await dispatch(editBillable({ id: row._id, billable: { status: 'Rejected' } })).unwrap();
pushToast?.({ title: 'Rejected', description: row.description || row.task || 'Billable rejected' });
} catch (e) { pushToast?.({ title: 'Error', description: e.message, variant: 'destructive' }); }
};


const onDelete = async (id)=>{
try { await dispatch(removeBillable(id)).unwrap(); pushToast?.({ title: 'Deleted' }); }
catch(e){ pushToast?.({ title: 'Error', description: e.message, variant: 'destructive' }); }
finally{ setConfirm(null); }
};

return (
<ToastProvider>
<div className="p-6 space-y-6">
<div className="flex items-center justify-between">
<Heading level={2} className="text-2xl font-semibold">Billable Approvals</Heading>
{loading && <Loader/>}
</div>
<Card className="p-0 overflow-hidden">
{loading ? (
<div className="p-8 flex justify-center"><Loader/></div>
) : !rows.length ? (
<EmptyState title="No billables pending" description="Team time entries will appear here for approval." />
) : (
<div className="overflow-x-auto">
<table className="min-w-full divide-y divide-gray-200">
<thead className="bg-gray-50">
<tr>
<th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Date</th>
<th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">User</th>
<th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Client / Case</th>
<th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Hours</th>
<th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
<th className="px-4 py-3" />
</tr>
</thead>
<tbody className="bg-white divide-y divide-gray-100">
{rows.map(r => (
<tr key={r._id} className="hover:bg-gray-50">
<td className="px-4 py-3 whitespace-nowrap">{r.date ? new Date(r.date).toLocaleDateString() : '—'}</td>
<td className="px-4 py-3 whitespace-nowrap">{r.userName || r.user || '—'}</td>
<td className="px-4 py-3 whitespace-nowrap">{r.clientName || '—'}{r.caseTitle ? ` / ${r.caseTitle}`: ''}</td>
<td className="px-4 py-3 whitespace-nowrap">{r.hours}</td>
<td className="px-4 py-3 whitespace-nowrap">{r.status || 'Pending'}</td>
<td className="px-4 py-3 text-right space-x-2">
<Button size="sm" variant="success" onClick={()=>approve(r)}>Approve</Button>
<Button size="sm" variant="secondary" onClick={()=>reject(r)}>Reject</Button>
<Button size="sm" variant="destructive" onClick={()=>setConfirm({ id: r._id })}>Delete</Button>
</td>
</tr>
))}
</tbody>
</table>
</div>
)}
{error && <div className="p-4 text-sm text-red-600">{error}</div>}
</Card>


<ConfirmDialog open={!!confirm} title="Delete billable?" onCancel={()=>setConfirm(null)} onConfirm={()=>onDelete(confirm.id)} />
</div>
</ToastProvider>
);
}