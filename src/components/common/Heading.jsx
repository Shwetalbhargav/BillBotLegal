// src/components/common/Heading.jsx
import React from "react";
import { clsx } from "../../utils/clsx";


export default function Heading({ level = 2, className, children, subtle = false }) {
const Tag = `h${level}`;
const sizes = { 1: "text-3xl", 2: "text-2xl", 3: "text-xl", 4: "text-lg" };
return (
<Tag
className={clsx(
sizes[level] || sizes[2],
"font-semibold tracking-[-0.01em]",
subtle ? "text-[color:var(--lb-muted)]" : "text-[color:var(--lb-text)]",
className
)}
>
{children}
</Tag>
);
}