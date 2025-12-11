// src/components/common/InlineAlert.jsx
import React from "react";
import { clsx } from "@utils/clsx.js";

export default function InlineAlert({
  tone = "info",
  title,
  children,
  className,
}) {
  const tones = {
    info: {
      bg: "bg-[color:var(--lb-bg)]",
      border: "border-[color:var(--lb-border)]",
      text: "text-[color:var(--lb-text)]",
    },
    warn: {
      bg: "bg-amber-50/70",
      border: "border-amber-200",
      text: "text-amber-900",
    },
    danger: {
      bg: "bg-rose-50/80",
      border: "border-rose-200",
      text: "text-rose-900",
    },
    success: {
      bg: "bg-emerald-50/80",
      border: "border-emerald-200",
      text: "text-emerald-900",
    },
  }[tone];

  return (
    <div
      className={clsx(
        "rounded-[var(--lb-radius-md)] border shadow-[var(--lb-shadow-xs)] px-3 py-2.5",
        "text-[13px] space-y-0.5",
        tones.bg,
        tones.border,
        tones.text,
        className
      )}
    >
      {title && <div className="font-medium">{title}</div>}
      {children && (
        <div className="opacity-90 leading-5">{children}</div>
      )}
    </div>
  );
}
