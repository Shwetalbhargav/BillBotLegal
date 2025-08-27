import React, { useMemo } from "react";
import { Checkbox } from "@/components/form";
import Pagination from "./Pagination";
import SkeletonRows from "./SkeletonRows";

export default function DataTable({
  columns, data, total,
  page, pageSize, onPageChange, onPageSizeChange,
  sort, onSortChange,
  selectedIds = [],
  onToggleRow, onToggleAll,
  rowKey, rowActions,
  loading = false,
  density = "comfy",
  stickyHeader = true,
  className,
}) {

  const hasSelection = columns.some(c => c.selection);
  const allIdsOnPage = useMemo(() => data.map(rowKey), [data, rowKey]);
  const allSelectedOnPage = hasSelection && allIdsOnPage.length > 0 && allIdsOnPage.every(id => selectedIds.includes(id));

  const cellPadding = density === "compact" ? "px-3 py-2" : "px-4 py-3";
  const headerPadding = density === "compact" ? "px-3 py-2.5" : "px-4 py-3.5";

  return (
    <div className={className ?? ""}>
      <div className="overflow-auto border border-[color:var(--lb-border)] rounded-[var(--lb-radius-lg)]">
        <table className="min-w-full bg-[color:var(--lb-bg)]">
          <thead className={stickyHeader ? "sticky top-0 z-10 bg-[color:var(--lb-surface)]" : ""}>
            <tr>
              {hasSelection && (
                <th className={`${headerPadding} text-left border-b border-[color:var(--lb-border)] w-[36px]`}>
                  <input
                    type="checkbox"
                    aria-label="Select all rows"
                    checked={allSelectedOnPage}
                    onChange={(e)=>onToggleAll?.(e.target.checked, allIdsOnPage)}
                  />
                </th>
              )}
              {columns.filter(c => !c.selection).map(col => (
                <th
                  key={col.id}
                  className={`${headerPadding} border-b border-[color:var(--lb-border)] text-left whitespace-nowrap`}
                  style={{ width: col.width }}
                >
                  <div className="flex items-center gap-2">
                    <button
                      className="font-semibold hover:underline disabled:no-underline disabled:opacity-60"
                      disabled={!col.sortable}
                      onClick={() => {
                        if (!col.sortable) return;
                        const next =
                          !sort || sort.id !== col.id ? { id: col.id, desc: false } :
                          sort.desc ? null : { id: col.id, desc: true };
                        onSortChange?.(next);
                      }}
                    >
                      {col.header}
                    </button>
                    {col.sortable && sort?.id === col.id && (
                      <span aria-hidden="true">{sort.desc ? "↓" : "↑"}</span>
                    )}
                    {col.filter && <div className="ml-2">{col.filter}</div>}
                  </div>
                </th>
              ))}
              {rowActions && <th className={`${headerPadding} border-b border-[color:var(--lb-border)] text-right`}>Actions</th>}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <SkeletonRows rows={Math.min(pageSize, 10)} cols={columns.length + (hasSelection?1:0) + (rowActions?1:0)} />
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (hasSelection?1:0) + (rowActions?1:0)} className="p-8 text-center text-[color:var(--lb-muted)]">
                  No results
                </td>
              </tr>
            ) : (
              data.map((row) => {
                const id = rowKey(row);
                const selected = selectedIds.includes(id);
                return (
                  <tr key={id} className="hover:bg-[color:var(--lb-surface)]">
                    {hasSelection && (
                      <td className={`${cellPadding} border-b border-[color:var(--lb-border)]`}>
                        <Checkbox checked={selected} onChange={(c)=>onToggleRow?.(id, c)} />
                      </td>
                    )}
                    {columns.filter(c => !c.selection).map(col => {
                      const content = col.cell ? col.cell(row) : col.accessor ? col.accessor(row) : null;
                      const align = col.align ?? "left";
                      return (
                        <td key={col.id} className={`${cellPadding} border-b border-[color:var(--lb-border)] text-${align}`}>
                          {content}
                        </td>
                      );
                    })}
                    {rowActions && (
                      <td className={`${cellPadding} border-b border-[color:var(--lb-border)] text-right`}>
                        {rowActions(row)}
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    </div>
  );
}
