// src/components/table/SkeletonRows.jsx
import React from "react";

/**
 * SkeletonRows – shimmering placeholder rows for tables.
 */
export default function SkeletonRows({
  rows = 5,
  cols = 4,
  rowHeight = "h-4",
  rounded = "rounded-xl",
  className,
}) {
  return (
    <div
      className={`w-full select-none ${className ?? ""}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">Loading…</span>
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, r) => (
          <div
            key={`sk-row-${r}`}
            className="grid grid-cols-12 gap-4 items-center"
          >
            {Array.from({ length: cols }).map((__, c) => {
              const span =
                cols >= 6
                  ? Math.max(2, Math.floor(12 / cols))
                  : Math.max(3, Math.floor(12 / cols));
              const colSpan =
                c === cols - 1
                  ? `col-span-${12 - span * (cols - 1)}`
                  : `col-span-${span}`;

              return (
                <div key={`sk-cell-${r}-${c}`} className={colSpan}>
                  <div
                    className={`
                      ${rowHeight} w-full ${rounded}
                      bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200
                      animate-pulse shadow-sm
                    `}
                  />
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
