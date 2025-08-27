import React from "react";
import { clsx } from "../../utils/clsx";

const MAP = {
  default: ["#e5e7eb", "#111827"],
  success: ["var(--lb-success-100)", "var(--lb-success-600)"],
  primary: ["var(--lb-primary-100)", "var(--lb-primary-700)"],
  danger: ["var(--lb-danger-100)", "var(--lb-danger-700)"],
  muted: ["#eef2f7", "var(--lb-muted)"],
};

export default function Badge({ children, color = "default", className }) {
  const [bg, fg] = MAP[color] ?? MAP.default;
  return (
    <span
      className={clsx(
        "lb-reset inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-medium",
        className
      )}
      style={{ background: bg, color: fg }}
    >
      {children}
    </span>
  );
}
