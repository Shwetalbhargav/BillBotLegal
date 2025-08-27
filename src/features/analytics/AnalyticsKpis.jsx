import React from "react";
import SkeletonRows from "@/components/table/SkeletonRows";

export default function AnalyticsKpis({ loading, totals }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_,i)=>(
          <div key={i} className="p-4 border rounded-[var(--lb-radius-lg)]">
            <div className="h-5 w-24 bg-gray-200 rounded mb-3" />
            <div className="h-8 w-32 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    );
  }
  const { hours=0, revenue=0, avgRate=0, loggedPct=0 } = totals || {};
  const card = (label, value, sub) => (
    <div className="p-4 border rounded-[var(--lb-radius-lg)] bg-[color:var(--lb-surface)]">
      <div className="text-sm text-[color:var(--lb-muted)]">{label}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
      {sub && <div className="text-xs text-[color:var(--lb-muted)] mt-1">{sub}</div>}
    </div>
  );
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {card("Total Hours", hours.toFixed(1))}
      {card("Revenue", `$${revenue.toFixed(2)}`)}
      {card("Average Rate", `$${avgRate.toFixed(0)}/hr`)}
      {card("Logged %", `${Math.round(loggedPct*100)}%`, "Logged entries / total")}
    </div>
  );
}
