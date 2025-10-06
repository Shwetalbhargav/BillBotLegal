// src/components/form/Radio.jsx
import React from "react";
import { clsx } from "../../utils/clsx";


export default function Radio({ label, name, invalid = false, className, ...props }) {
return (
<label className={clsx("lb-reset inline-flex items-center gap-2 cursor-pointer", className)}>
<input
type="radio"
name={name}
className={clsx(
"lb-reset w-4 h-4 rounded-full border border-[color:var(--lb-border)]",
"bg-[color:var(--lb-bg)] shadow-[var(--lb-shadow-xs)]",
"checked:border-[length:5px] checked:border-[color:var(--lb-primary-600)]",
"focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--lb-primary-600)]",
invalid && "border-[color:var(--lb-danger-400)]"
)}
{...props}
/>
<span className="text-[color:var(--lb-text)] text-[var(--lb-fs-sm)]">{label}</span>
</label>
);
}