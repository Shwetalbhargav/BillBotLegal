import React, { useMemo } from "react";
import { Badge } from "@/components/common";

/** Show totals for either selected rows or current list */
export default function TotalsBar({ rows = [], showSelectionBadge = false }) {
  const { hours, amount } = useMemo(() => {
    return rows.reduce((acc, r) => {
      const h = Number(r.hours || 0);
      const a = Number((r.amount ?? h * (r.rate || 0)) || 0);
      return { hours: acc.hours + h, amount: acc.amount + a };
    }, { hours: 0, amount: 0 });
  }, [rows]);

  if (!rows.length) return null;

  return (
    <aside
      className="fixed right-6 bottom-6 z-40 rounded-[var(--lb-radius-lg)] border border-[color:var(--lb-border)] bg-[color:var(--lb-bg)] shadow-[var(--lb-shadow-md)] px-5 py-4"
      style={{ minWidth: 260 }}
      aria-live="polite"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="font-semibold">Totals</div>
        {showSelectionBadge && <Badge color="primary">{rows.length} selected</Badge>}
      </div>
      <dl className="mt-3 space-y-1 text-sm">
        <div className="flex justify-between"><dt className="text-[color:var(--lb-muted)]">Hours</dt><dd>{hours.toFixed(1)}</dd></div>
        <div className="flex justify-between"><dt className="text-[color:var(--lb-muted)]">Amount</dt><dd>${amount.toFixed(2)}</dd></div>
      </dl>
    </aside>
  );
}
