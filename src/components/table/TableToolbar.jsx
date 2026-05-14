import React from "react";
import { clsx } from "../../utils/clsx.js";

export default function TableToolbar({
  left,
  right,
  children,
  className,
  rightActions,
}) {
  return (
    <div
      className={clsx(
        "flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between",
        "rounded-t-[var(--lb-radius-xl)] border border-b-0 border-[color:var(--lb-border)]",
        "bg-[color:var(--lb-surface-subtle)] text-[color:var(--lb-text)]",
        className
      )}
    >
      {children ? (
        children
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2">{left}</div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            {right}
            {rightActions}
          </div>
        </>
      )}
    </div>
  );
}
