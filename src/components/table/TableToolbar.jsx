// src/components/table/TableToolbar.jsx
import React from "react";
import { clsx } from "@utils/clsx.js";

export default function TableToolbar({ left, right, className }) {
  return (
    <div
      className={clsx(
        "flex items-center justify-between gap-3 px-3 py-2",
        "rounded-t-[var(--lb-radius-xl)] border border-b-0 border-[color:var(--lb-border)]",
        "bg-[color:var(--lb-bg)] text-[color:var(--lb-text)] shadow-[var(--lb-shadow-sm)]",
        className
      )}
    >
      <div className="flex items-center gap-2">{left}</div>
      <div className="flex items-center gap-2">{right}</div>
    </div>
  );
}
