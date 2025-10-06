// src/components/table/Table.jsx
import React from "react";
import { clsx } from "../../utils/clsx";


export function Table({ className, children }) {
return (
<div className={clsx(
"lb-reset overflow-auto rounded-[var(--lb-radius-xl)] border border-[color:var(--lb-border)]",
"bg-[color:var(--lb-surface)] shadow-[var(--lb-shadow-sm)]",
className
)}>
<table className="w-full border-collapse text-left text-[color:var(--lb-text)]">
{children}
</table>
</div>
);
}


export function THead({ className, children, sticky = true }) {
return (
<thead className={clsx(
sticky && "sticky top-0 z-10",
"bg-[color:var(--lb-bg)] text-[color:var(--lb-muted)]",
"shadow-[inset_0_-1px_0_var(--lb-border)]",
className
)}>
{children}
</thead>
);
}


export function TBody({ children }) {
return <tbody>{children}</tbody>;
}


export function TR({ className, children, hover = true, onClick }) {
return (
<tr
onClick={onClick}
className={clsx(
"border-b border-[color:var(--lb-border)] last:border-b-0",
hover && "hover:bg-[color:var(--lb-bg)]",
onClick && "cursor-pointer",
className
)}
>
{children}
</tr>
);
}


export function TH({ className, children, align = "left", width }) {
return (
<th
scope="col"
style={width ? { width } : undefined}
className={clsx("px-3 py-2 text-sm font-medium", align === "right" && "text-right", className)}
>
{children}
</th>
);
}


export function TD({ className, children, align = "left" }) {
return (
<td className={clsx("px-3 py-2 text-sm", align === "right" && "text-right", className)}>
{children}
</td>
);
}