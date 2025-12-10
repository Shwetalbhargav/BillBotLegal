// src/components/table/Column.jsx
// Soft-UI helpers to standardize column styling.

import React from "react";

/** Base Soft-UI tokens */
export const SOFT_TABLE = {
  header:
    "px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] " +
    "text-[color:var(--lb-muted)] select-none",
  cell:
    "px-3 py-2 text-[13px] text-[color:var(--lb-text)]",
  row:
    "hover:bg-[color:var(--lb-bg)] transition-colors",
  table:
    "w-full border-separate border-spacing-0",
  thead:
    "bg-[color:var(--lb-bg)]",
  tbody:
    "bg-[color:var(--lb-surface)]",
  th:
    "text-left align-middle",
  td:
    "align-middle border-t border-[color:var(--lb-border)]/60",
};

/** Alignment mapping */
const alignClass = (align) =>
  align === "right"
    ? "text-right"
    : align === "center"
    ? "text-center"
    : "text-left";

/** Simple sort indicator */
export function SortIndicator({ direction }) {
  if (!direction)
    return <span className="inline-block w-3" aria-hidden="true" />;

  return (
    <span
      className="inline-block w-3 ml-1 text-[color:var(--lb-muted)]"
      aria-hidden="true"
    >
      {direction === "desc" ? "▾" : "▴"}
    </span>
  );
}

/**
 * Decorate a column definition with soft-UI header/cell classes.
 *
 * Props on each column:
 *  - id, header, accessor, cell, align ("left" | "center" | "right")
 *  - headerClassName, cellClassName
 *  - sortable (boolean)
 */
export function withSoftUI(col) {
  const align = alignClass(col.align);

  return {
    ...col,
    headerClassName: [
      SOFT_TABLE.header,
      align,
      col.sortable ? "cursor-pointer select-none" : "",
      col.headerClassName || "",
    ]
      .filter(Boolean)
      .join(" "),
    cellClassName: [SOFT_TABLE.cell, align, col.cellClassName || ""]
      .filter(Boolean)
      .join(" "),
  };
}

/** Map an array of column defs */
export function makeColumns(defs = []) {
  return defs.map(withSoftUI);
}

/** Optional convenience header component */
export function SoftHeader({ title, sortable, sortDirection }) {
  return (
    <div className="flex items-center">
      <span>{title}</span>
      {sortable ? <SortIndicator direction={sortDirection} /> : null}
    </div>
  );
}

/** Optional soft cell wrapper */
export function SoftCell({ className = "", children }) {
  return (
    <div className={[SOFT_TABLE.cell, className].join(" ")}>
      {children}
    </div>
  );
}

export default {
  SOFT_TABLE,
  SortIndicator,
  SoftHeader,
  SoftCell,
  withSoftUI,
  makeColumns,
};
