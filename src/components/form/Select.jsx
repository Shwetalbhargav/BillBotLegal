// src/components/form/Select.jsx
import React from "react";
import { clsx } from "../../utils/clsx";


export default function Select({ invalid = false, className, children, ...props }) {
return (
<div className={clsx("relative", className)}>
<select
className={clsx(
"lb-reset w-full appearance-none rounded-[var(--lb-radius-md)] bg-[color:var(--lb-bg)]",
"border border-[color:var(--lb-border)] shadow-[var(--lb-shadow-sm)]",
"text-[color:var(--lb-text)] focus:outline-none focus-visible:ring-2",
"focus-visible:ring-[color:var(--lb-primary-600)] px-3.5 h-10 text-[var(--lb-fs-md)]",
invalid && "border-[color:var(--lb-danger-400)]"
)}
{...props}
>
{children}
</select>
<span
aria-hidden
className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
>
▾
</span>
</div>
);
}