// src/components/table/EmptyState.jsx
import React from "react";
import { Button } from "@/components/common";

export default function EmptyState({
  title = "No data",
  description = "Try adjusting filters or add a new record.",
  actionText,
  onAction,
  className,
}) {
  return (
    <div
      className={[
        "text-center py-12 px-6 rounded-2xl border",
        "border-[color:var(--lb-border)] bg-[color:var(--lb-surface)]",
        "shadow-[var(--lb-shadow-sm)] antialiased",
        className ?? "",
      ].join(" ")}
    >
      <div className="text-[16px] font-semibold text-[color:var(--lb-text)]">
        {title}
      </div>
      <div className="mt-2 text-[13px] text-[color:var(--lb-muted)]">
        {description}
      </div>

      {actionText && (
        <div className="mt-6">
          <Button size="sm" onClick={onAction}>
            {actionText}
          </Button>
        </div>
      )}
    </div>
  );
}
