// src/components/common/InlineAlert.jsx
import React from "react";
import { clsx } from "../../utils/clsx";


export default function InlineAlert({ tone = "info", title, children, className }) {
const tones = {
info: {
bg: "bg-[color:var(--lb-bg)]",
border: "border-[color:var(--lb-border)]",
text: "text-[color:var(--lb-text)]",
},
warn: {
bg: "bg-amber-50/60",
border: "border-amber-200",
text: "text-amber-800",
},
danger: {
bg: "bg-red-50/70",
border: "border-red-200",
text: "text-red-800",
},
success: {
bg: "bg-emerald-50/70",
border: "border-emerald-200",
text: "text-emerald-800",
},
}[tone];


return (
<div className={clsx(
"rounded-[var(--lb-radius-md)] border shadow-[var(--lb-shadow-xs)] px-3 py-2",
tones.bg, tones.border, tones.text, className
)}>
{title && <div className="font-medium">{title}</div>}
{children && <div className="text-sm opacity-90">{children}</div>}
</div>
);
}