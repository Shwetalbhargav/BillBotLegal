// src/components/common/Badge.jsx
import React from "react";
import { clsx } from "@utils/clsx.js";

export default function Badge({ tone = "info", children, className }) {
  const toneClass =
    {
      info: "bg-[color:var(--lb-bg)] text-[color:var(--lb-text)] border-[color:var(--lb-border)]",
      muted:
        "bg-[color:var(--lb-bg)] text-[color:var(--lb-muted)] border-[color:var(--lb-border)]",
      success: "bg-emerald-50 text-emerald-800 border-emerald-200",
      warn: "bg-amber-50 text-amber-800 border-amber-200",
      danger: "bg-red-50 text-red-800 border-red-200",
    }[tone] || "bg-[color:var(--lb-bg)] text-[color:var(--lb-text)] border-[color:var(--lb-border)]";

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-[999px] border",
        "px-2 py-0.5 text-[11px] font-medium",
        "shadow-[var(--lb-shadow-xs)]",
        toneClass,
        className
      )}
    >
      {children}
    </span>
  );
}
