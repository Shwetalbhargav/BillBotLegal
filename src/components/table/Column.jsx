// Column.js (Soft-UI Refactor)
// Generic helpers to standardize table column styling (headers, cells, alignment, sortable affordance)
// Replace any old lb-* class props with these Tailwind-based defaults.

import React from "react";

/** Base Soft-UI tokens */
export const SOFT_TABLE = {
  header:
    "px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-600 select-none",
  cell:
    "px-3 py-2 text-sm text-gray-900",
  row:
    "hover:bg-gray-50 transition-colors",
  // Use on the <table> wrapper if needed:
  table:
    "w-full border-separate border-spacing-0 rounded-2xl overflow-hidden",
  thead:
    "bg-gradient-to-b from-white to-gray-50 border-b border-gray-200/70",
  tbody:
    "bg-white",
  th:
    "text-left align-middle",
  td:
    "align-middle border-t border-gray-100",
};

/** Alignment mapping */
const alignClass = (align) =>
  align === "right"
    ? "text-right"
    : align === "center"
    ? "text-center"
    : "text-left";

/**
 * Sort indicator (pure CSS/Unicode; swap if your table lib gives you sort state)
 */
export function SortIndicator({ direction }) {
  if (!direction) return <span className="inline-block w-3" aria-hidden="true" />;
  return (
    <span
      className="inline-block w-3 ml-1 text-gray-400"
      aria-hidden="true"
    >
      {direction === "desc" ? "▾" : "▴"}
    </span>
  );
}

/**
 * Compose Soft-UI classes onto a column definition.
 * Works with plain objects you use to render headers/cells manually,
 * or with many table libs that accept `headerClassName` / `cellClassName`.
 *
 * Supported incoming props on each column:
 *  - id, header, accessor, render (Cell), align ("left" | "center" | "right")
 *  - headerClassName, cellClassName
 *  - sortable (boolean) – optional, for header affordance only
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

/**
 * Apply Soft-UI styling to an array of column defs.
 */
export function makeColumns(defs = []) {
  return defs.map(withSoftUI);
}

/**
 * Optional convenience header renderer if you don’t have one already.
 * Usage inside your <th>:
 *   <SoftHeader title="Client" sortable sortDirection={state} />
 */
export function SoftHeader({ title, sortable, sortDirection }) {
  return (
    <div className="flex items-center">
      <span>{title}</span>
      {sortable ? <SortIndicator direction={sortDirection} /> : null}
    </div>
  );
}

/**
 * Optional convenience cell wrapper to keep padding/typography consistent
 * if you render cells manually.
 */
export function SoftCell({ className = "", children }) {
  return <div className={[SOFT_TABLE.cell, className].join(" ")}>{children}</div>;
}

export default {
  SOFT_TABLE,
  SortIndicator,
  SoftHeader,
  SoftCell,
  withSoftUI,
  makeColumns,
};
