// src/components/common/Badge.jsx
import React from "react";
import { clsx } from "../../utils/clsx.js";

export default function Badge({ tone = "info", color, children, className }) {
  const resolvedTone = color || tone;
  const toneClass =
    {
      info: "bg-[color:var(--lb-info-50)] text-[color:var(--lb-primary-700)] border-[color:var(--lb-primary-100)]",
      primary: "bg-[color:var(--lb-primary-50)] text-[color:var(--lb-primary-700)] border-[color:var(--lb-primary-100)]",
      muted:
        "bg-[color:var(--lb-surface-subtle)] text-[color:var(--lb-muted-strong)] border-[color:var(--lb-border)]",
      secondary:
        "bg-[color:var(--lb-surface-subtle)] text-[color:var(--lb-muted-strong)] border-[color:var(--lb-border)]",
      success: "bg-[color:var(--lb-success-50)] text-[color:var(--lb-success-700)] border-[color:var(--lb-success-100)]",
      warn: "bg-[color:var(--lb-warning-50)] text-[color:var(--lb-warning-700)] border-[color:var(--lb-warning-100)]",
      warning: "bg-[color:var(--lb-warning-50)] text-[color:var(--lb-warning-700)] border-[color:var(--lb-warning-100)]",
      danger: "bg-[color:var(--lb-danger-50)] text-[color:var(--lb-danger-700)] border-[color:var(--lb-danger-100)]",
    }[resolvedTone] || "bg-[color:var(--lb-info-50)] text-[color:var(--lb-primary-700)] border-[color:var(--lb-primary-100)]";

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-[999px] border",
        "px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-[0.08em]",
        toneClass,
        className
      )}
    >
      {children}
    </span>
  );
}
