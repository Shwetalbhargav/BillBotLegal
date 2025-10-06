// src/components/form/Textarea.jsx
import React from "react";
import { clsx } from "../../utils/clsx";


export default function Textarea({ rows = 4, invalid = false, className, ...props }) {
return (
<textarea
rows={rows}
className={clsx(
"lb-reset w-full rounded-[var(--lb-radius-md)] bg-[color:var(--lb-bg)]",
"border border-[color:var(--lb-border)] shadow-[var(--lb-shadow-sm)]",
"placeholder:text-[color:var(--lb-muted)] text-[color:var(--lb-text)]",
"focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--lb-primary-600)]",
"px-3.5 py-2 text-[var(--lb-fs-md)]",
invalid && "border-[color:var(--lb-danger-400)]",
className
)}
{...props}
/>
);
}