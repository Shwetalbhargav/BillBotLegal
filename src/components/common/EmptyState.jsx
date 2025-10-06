// src/components/common/EmptyState.jsx
import React from "react";
import Card from "./Card";
import { clsx } from "../../utils/clsx";


export default function EmptyState({ icon, title, description, children, className }) {
return (
<Card className={clsx("text-center py-10", className)}>
<div className="mx-auto mb-3 h-12 w-12 grid place-items-center rounded-full bg-[color:var(--lb-bg)] border border-[color:var(--lb-border)] shadow-[var(--lb-shadow-xs)]">
{icon}
</div>
<h3 className="text-[color:var(--lb-text)] text-xl font-semibold">{title}</h3>
{description && (
<p className="mt-1 text-[color:var(--lb-muted)]">{description}</p>
)}
{children && <div className="mt-4 flex items-center justify-center gap-2">{children}</div>}
</Card>
);
}