// EmptyState.jsx (Soft-UI Refactor)
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
      className={`text-center py-16 px-6 rounded-2xl border border-gray-200/70 bg-white shadow-sm
                  antialiased ${className ?? ""}`}
    >
      <div className="text-lg font-semibold text-gray-900">{title}</div>
      <div className="mt-2 text-sm text-gray-500">{description}</div>

      {actionText && (
        <div className="mt-6">
          <Button onClick={onAction}>{actionText}</Button>
        </div>
      )}
    </div>
  );
}
