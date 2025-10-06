// ClientTable.jsx (Soft-UI Refactor)
import React from "react";
import EmptyState from "./EmptyState";
import SkeletonRows from "./SkeletonRows";
import { makeColumns, SOFT_TABLE, SoftHeader } from "./Column";

/**
 * ClientTable
 * Soft-UI styled, accessible table for listing clients.
 *
 * Props:
 *  - data: array of client rows (default [])
 *  - columns: array of column defs:
 *      { id, header, accessor, align?, sortable?, render?(row), headerClassName?, cellClassName? }
 *    (Run through makeColumns to apply Soft-UI classes.)
 *  - loading: boolean
 *  - onSort: (colId) => void  (optional)
 *  - sortBy: current sorted column id (optional)
 *  - sortDirection: "asc" | "desc" (optional)
 *  - onRowClick: (row) => void (optional)
 *  - className: extra wrapper classes (optional)
 */
export default function ClientTable({
  data = [],
  columns = [],
  loading = false,
  onSort,
  sortBy,
  sortDirection,
  onRowClick,
  className,
}) {
  const cols = makeColumns(
    columns.length
      ? columns
      : // Sensible defaults if no columns are provided
        [
          { id: "name", header: "Client", accessor: "name", sortable: true },
          { id: "email", header: "Email", accessor: "email" },
          { id: "matters", header: "Matters", accessor: "mattersCount", align: "right" },
          { id: "status", header: "Status", accessor: "status" },
        ]
  );

  const handleHeaderClick = (col) => {
    if (!col.sortable || !onSort) return;
    onSort(col.id);
  };

  return (
    <div
      className={`rounded-2xl border border-gray-200/70 bg-white shadow-sm overflow-hidden ${className ?? ""}`}
    >
      <table className={`${SOFT_TABLE.table}`}>
        <thead className={SOFT_TABLE.thead}>
          <tr>
            {cols.map((col) => {
              const isSorted = sortBy === col.id ? sortDirection : undefined;
              return (
                <th
                  key={col.id}
                  scope="col"
                  className={`${SOFT_TABLE.th} ${col.headerClassName}`}
                  onClick={() => handleHeaderClick(col)}
                >
                  <div className={col.sortable ? "flex items-center cursor-pointer" : "flex items-center"}>
                    <SoftHeader title={col.header} sortable={!!col.sortable} sortDirection={isSorted} />
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>

        <tbody className={SOFT_TABLE.tbody}>
          {/* Loading state */}
          {loading && (
            <tr>
              <td colSpan={cols.length} className="px-3 py-4">
                <SkeletonRows rows={6} cols={cols.length} />
              </td>
            </tr>
          )}

          {/* Empty state */}
          {!loading && data.length === 0 && (
            <tr>
              <td colSpan={cols.length} className="px-3 py-10">
                <EmptyState
                  title="No clients found"
                  description="Try adjusting your filters or add a new client."
                />
              </td>
            </tr>
          )}

          {/* Data rows */}
          {!loading &&
            data.length > 0 &&
            data.map((row, idx) => (
              <tr
                key={row.id ?? idx}
                className={SOFT_TABLE.row}
                onClick={() => onRowClick?.(row)}
              >
                {cols.map((col) => {
                  const content =
                    typeof col.render === "function"
                      ? col.render(row)
                      : col.accessor
                      ? row[col.accessor]
                      : null;

                  return (
                    <td key={`${col.id}-${row.id ?? idx}`} className={`${SOFT_TABLE.td} ${col.cellClassName}`}>
                      {content}
                    </td>
                  );
                })}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
