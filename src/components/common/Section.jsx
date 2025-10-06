// src/components/common/Section.jsx
import React from "react";


export default function Section({ title, description, action, children }) {
return (
<section className="grid gap-4">
<header className="flex items-end justify-between gap-3">
<div>
<h2 className="text-[color:var(--lb-text)] text-xl font-semibold">{title}</h2>
{description && (
<p className="text-[color:var(--lb-muted)] mt-1">{description}</p>
)}
</div>
{action}
</header>
{children}
</section>
);
}