// src/components/common/EmptyState.jsx
import React from "react";
import Card from "./Card";
import { clsx } from "../../utils/clsx.js";

export default function EmptyState({
  icon,
  title,
  description,
  children,
  className,
}) {
  return (
    <Card
      padding="lg"
      className={clsx("text-center py-10 space-y-3", className)}
    >
      {icon && (
        <div className="mx-auto mb-1 h-12 w-12 grid place-items-center rounded-full bg-[color:var(--lb-bg)] border border-[color:var(--lb-border)] shadow-[var(--lb-shadow-xs)] text-[color:var(--lb-muted)]">
          {icon}
        </div>
      )}

      {title && (
        <h3 className="text-[18px] font-semibold text-[color:var(--lb-text)]">
          {title}
        </h3>
      )}

      {description && (
        <p className="text-[13px] text-[color:var(--lb-muted)] max-w-md mx-auto">
          {description}
        </p>
      )}

      {children && (
        <div className="mt-4 flex items-center justify-center gap-2">
          {children}
        </div>
      )}
    </Card>
  );
}
