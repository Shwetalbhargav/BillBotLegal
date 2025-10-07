// ===============================
// File: features/admin/Overview.jsx
// ===============================
import React, { useMemo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAnalytics } from "@/store/analyticsSlice";
import { Card, Heading, Loader } from "@/components/ui";


function KPI({ label, value }){
return (
<div className="p-5 rounded-2xl bg-white shadow-sm border">
<div className="text-sm text-gray-500">{label}</div>
<div className="text-3xl font-semibold">{value}</div>
</div>
);
}


export default function Overview(){
const dispatch = useDispatch();
const { billable, invoice, unbilled, loading } = useSelector(s => s.analytics || { billable:{entries:[]}, invoice:{entries:[]}, unbilled:{entries:[]}, loading:false });


useEffect(()=>{ dispatch(fetchAnalytics()); },[dispatch]);


const kpis = useMemo(()=>{
const sum = (arr, k)=> (arr||[]).reduce((a,b)=> a + Number(b?.[k]||0), 0);
return [
{ label: 'Open Unbilled ($)', value: `$${sum(unbilled.entries,'revenue').toFixed(2)}` },
{ label: 'Billable Hours (30d)', value: sum(billable.entries,'hours').toFixed(1) },
{ label: 'Invoiced ($)', value: `$${sum(invoice.entries,'revenue').toFixed(2)}` },
];
},[billable, invoice, unbilled]);


return (
    <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
            <Heading level={2} className="text-2xl font-semibold">Overview</Heading>
            {loading && <Loader/>}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {kpis.map(k=> <KPI key={k.label} {...k} />)}
                </div>
            <Card className="p-6">
            <Heading level={3} className="text-lg font-semibold mb-2">What to do next</Heading>
                <ul className="list-disc ml-5 text-gray-700 space-y-1">
                <li>Review pending <strong>Billable Approvals</strong> and approve entries.</li>
                <li>Convert approved billables into <strong>Invoices</strong>.</li>
                <li>Check <strong>Analytics</strong> for revenue and utilization trends.</li>
                </ul>
        </Card>
    </div>
);
}

