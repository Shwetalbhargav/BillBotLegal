import React from "react";
import { DatePicker } from "@/components/forms";

export default function DateRangePicker({ from, to, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <DatePicker label={null} placeholder="From" value={from || ""} onChange={(v)=>onChange?.({ from: v, to })} size="sm" />
      <span className="text-sm text-[color:var(--lb-muted)]">–</span>
      <DatePicker label={null} placeholder="To" value={to || ""} onChange={(v)=>onChange?.({ from, to: v })} size="sm" />
    </div>
  );
}
