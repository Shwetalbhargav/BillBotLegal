// src/components/form/Checkbox.jsx
import React from "react";
import { clsx } from "../../utils/clsx";


export default function Checkbox({ label, invalid = false, className, ...props }) {
return (
<label className={clsx("lb-reset inline-flex items-center gap-2 cursor-pointer", className)}>
<input
type="checkbox"
className={clsx(
"lb-reset w-4 h-4 rounded border border-[color:var(--lb-border)]",
"bg-[color:var(--lb-bg)] shadow-[var(--lb-shadow-xs)]",
"checked:bg-[color:var(--lb-primary-600)] checked:border-[color:var(--lb-primary-600)]",
"focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--lb-primary-600)]",
invalid && "border-[color:var(--lb-danger-400)]"
)}
{...props}
/>
<span className="text-[color:var(--lb-text)] text-[var(--lb-fs-sm)]">{label}</span>
</label>
);
}