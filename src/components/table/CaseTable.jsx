// CaseTable.jsx (Soft-UI Refactor)
import React from "react";
import EmptyState from "./EmptyState";
import SkeletonRows from "./SkeletonRows";
import { makeColumns, SOFT_TABLE, SoftHeader } from "./Column";

/**
 * CaseTable (aka Matters)
 * A Soft-UI styled, accessible table for listing cases/matters.
 *
 * Props:
 *  - data: array (default [])
 *  - columns: optional custom columns; if omitted sensible defaults are used
 *      { id, header, accessor, align?, sortable?, render?(row), headerClassName?, cellClassName? }
 *  - loading: boolean
 *  - onSort(colId): optional
 *  - sortBy: string
 *  - sortDirection: "asc" | "desc"
 *  - onRowClick(row): optional
 *  - className: string
 */
export default function CaseTable({
  data = [],
  columns = [],
  loading = false,
  onSort,
  sortBy,
  sortDirection,
  onRowClick,
  className,
}) {
  const defaultCols = [
    { id: "caseNumber", header: "Case #", accessor: "caseNumber", sortable: true },
    { id: "title", header: "Title", accessor: "title", sortable: true },
    { id: "client", header: "Client", accessor: "clientName", sortable: true },
    {
      id: "openedOn",
      header: "Opened",
      accessor: "openedOn",
      sortable: true,
      render: (row) =>
        row.openedOn
          ? new Date(row.openedOn).toLocaleDateString()
          : "—",
    },
    {
      id: "status",
      header: "Status",
      accessor: "status",
      sortable: true,
      render: (row) => (
        <span
          className={`inline-flex items-center px-2 py-1 rounded-xl text-xs font-medium
            ${
              row.status === "Open"
                ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                : row.status === "On Hold"
                ? "bg-amber-50 text-amber-700 border border-amber-100"
                : "bg-gray-50 text-gray-700 border border-gray-200"
            }`}
        >
          {row.status ?? "—"}
        </span>
      ),
    },
    {
      id: "billableHours",
      header: "Hours",
      accessor: "billableHours",
      align: "right",
      sortable: true,
      render: (row) =>
        typeof row.billableHours === "number" ? row.billableHours.toFixed(2) : "0.00",
    },
    {
      id: "unpaidBalance",
      header: "Unpaid",
      accessor: "unpaidBalance",
      align: "right",
      sortable: true,
      render: (row) =>
        typeof row.unpaidBalance === "number"
          ? row.unpaidBalance.toLocaleString(undefined, {
              style: "currency",
              currency: "USD",
            })
          : "$0.00",
    },
  ];

  const cols = makeColumns(columns.length ? columns : defaultCols);

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
          {/* Loading */}
          {loading && (
            <tr>
              <td colSpan={cols.length} className="px-3 py-4">
                <SkeletonRows rows={6} cols={cols.length} />
              </td>
            </tr>
          )}

          {/* Empty */}
          {!loading && data.length === 0 && (
            <tr>
              <td colSpan={cols.length} className="px-3 py-10">
                <EmptyState
                  title="No cases found"
                  description="Try adjusting your filters or create a new case."
                />
              </td>
            </tr>
          )}

          {/* Rows */}
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
                    <td
                      key={`${col.id}-${row.id ?? idx}`}
                      className={`${SOFT_TABLE.td} ${col.cellClassName}`}
                    >
                      {content ?? "—"}
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
