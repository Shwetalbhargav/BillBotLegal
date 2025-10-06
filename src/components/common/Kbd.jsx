// src/components/common/Kbd.jsx
import React from "react";


export default function Kbd({ children }) {
return (
<kbd className="inline-flex items-center rounded-[var(--lb-radius-sm)] border border-[color:var(--lb-border)] bg-[color:var(--lb-bg)] px-1.5 py-0.5 text-[11px] font-mono text-[color:var(--lb-muted)] shadow-[var(--lb-shadow-xs)]">
{children}
</kbd>
);
}