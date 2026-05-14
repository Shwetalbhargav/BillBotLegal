// src/components/common/InlineAlert.jsx
import React from "react";
import { clsx } from "../../utils/clsx.js";

export default function InlineAlert({
  tone = "info",
  title,
  children,
  className,
}) {
  const tones = {
    info: {
      bg: "bg-[color:var(--lb-info-50)]",
      border: "border-[color:var(--lb-primary-100)]",
      text: "text-[color:var(--lb-primary-900)]",
    },
    warn: {
      bg: "bg-[color:var(--lb-warning-50)]",
      border: "border-[color:var(--lb-warning-100)]",
      text: "text-[color:var(--lb-warning-700)]",
    },
    danger: {
      bg: "bg-[color:var(--lb-danger-50)]",
      border: "border-[color:var(--lb-danger-100)]",
      text: "text-[color:var(--lb-danger-700)]",
    },
    success: {
      bg: "bg-[color:var(--lb-success-50)]",
      border: "border-[color:var(--lb-success-100)]",
      text: "text-[color:var(--lb-success-700)]",
    },
  }[tone];

  return (
    <div
      className={clsx(
        "rounded-[var(--lb-radius-md)] border shadow-[var(--lb-shadow-sm)] px-4 py-3",
        "text-[14px] space-y-1",
        tones.bg,
        tones.border,
        tones.text,
        className
      )}
    >
      {title && <div className="font-extrabold">{title}</div>}
      {children && (
        <div className="opacity-90 leading-5">{children}</div>
      )}
    </div>
  );
}
