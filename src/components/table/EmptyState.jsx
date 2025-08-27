import React from "react";
import { Button } from "@/components/common";

export default function EmptyState({ title = "No data", description = "Try adjusting filters or add a new record.", actionText, onAction }) {
  return (
    <div className="lb-reset text-center py-16 border border-[color:var(--lb-border)] rounded-[var(--lb-radius-lg)]">
      <div className="text-lg font-medium">{title}</div>
      <div className="lb-help mt-1">{description}</div>
      {actionText && (
        <div className="mt-4">
          <Button onClick={onAction}>{actionText}</Button>
        </div>
      )}
    </div>
  );
}
