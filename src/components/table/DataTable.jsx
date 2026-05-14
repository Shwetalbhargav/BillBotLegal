import React from "react";
import { Search } from "lucide-react";
import { Table, THead, TBody, TR, TH, TD } from "./Table";
import Pagination from "./Pagination";
import TableToolbar from "./TableToolbar";
import { clsx } from "../../utils/clsx.js";

function SortIcon({ dir }) {
  return (
    <span aria-hidden className="ml-1 inline-block text-[10px] opacity-70">
      {dir === "asc" ? "▲" : dir === "desc" ? "▼" : "◇"}
    </span>
  );
}

export default function DataTable({
  columns = [],
  rows,
  data,
  searchableKeys = [],
  initialSort,
  pageSize = 10,
  page: controlledPage,
  total: controlledTotal,
  sort: controlledSort,
  selectedIds: controlledSelectedIds,
  rowSelectable = false,
  loading = false,
  skeleton,
  stickyHeader = true,
  hidePagination = false,
  emptyState,
  className,
  toolbarLeft,
  toolbarRight,
  rowKey,
  onPage,
  onPageChange,
  onPageSizeChange,
  onSortChange,
  onSelectionChange,
  onToggleRow,
  onToggleAll,
}) {
  const sourceRows = Array.isArray(data) ? data : Array.isArray(rows) ? rows : [];
  const hasExternalPaging = controlledPage != null || controlledTotal != null;
  const [query, setQuery] = React.useState("");
  const [internalPage, setInternalPage] = React.useState(1);
  const [internalSort, setInternalSort] = React.useState(initialSort || null);
  const [internalSelected, setInternalSelected] = React.useState(new Set());

  const page = controlledPage ?? internalPage;
  const sort = normalizeSort(controlledSort ?? internalSort);
  const selectable = rowSelectable || columns.some((column) => column.selection);
  const selectedIds = controlledSelectedIds
    ? new Set(controlledSelectedIds)
    : internalSelected;

  const setPage = (next) => {
    setInternalPage(next);
    onPageChange?.(next);
    onPage?.(next);
  };

  const filtered = React.useMemo(() => {
    if (!query || searchableKeys.length === 0) return sourceRows;
    const q = query.toLowerCase();
    return sourceRows.filter((row) =>
      searchableKeys.some((key) =>
        String(row?.[key] ?? "")
          .toLowerCase()
          .includes(q)
      )
    );
  }, [query, searchableKeys, sourceRows]);

  const sorted = React.useMemo(() => {
    if (!sort || hasExternalPaging) return filtered;
    const column = columns.find((c) => c.id === sort.id);
    const accessor = column?.accessor || ((row) => row?.[column?.id]);
    return [...filtered].sort((a, b) => {
      const av = comparableValue(accessor(a));
      const bv = comparableValue(accessor(b));
      if (av == null && bv == null) return 0;
      if (av == null) return sort.desc ? 1 : -1;
      if (bv == null) return sort.desc ? -1 : 1;
      if (typeof av === "number" && typeof bv === "number") {
        return sort.desc ? bv - av : av - bv;
      }
      return sort.desc
        ? String(bv).localeCompare(String(av))
        : String(av).localeCompare(String(bv));
    });
  }, [columns, filtered, hasExternalPaging, sort]);

  const total = controlledTotal ?? sorted.length;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const pageRows = hasExternalPaging
    ? sorted
    : sorted.slice((page - 1) * pageSize, page * pageSize);

  const visibleIds = pageRows.map((row, index) => getRowId(row, index, rowKey));
  const allChecked =
    selectable && visibleIds.length > 0 && visibleIds.every((id) => selectedIds.has(id));
  const someChecked =
    selectable && !allChecked && visibleIds.some((id) => selectedIds.has(id));

  React.useEffect(() => {
    onSelectionChange?.([...selectedIds]);
  }, [onSelectionChange, selectedIds]);

  const toggleSort = (id, sortable) => {
    if (!sortable) return;
    const current = sort?.id === id ? sort : null;
    const next = !current
      ? { id, desc: false }
      : current.desc
      ? null
      : { id, desc: true };
    setInternalPage(1);
    setInternalSort(next);
    onSortChange?.(next);
  };

  const toggleAll = (checked) => {
    onToggleAll?.(checked, visibleIds);
    if (controlledSelectedIds) return;
    setInternalSelected((prev) => {
      const next = new Set(prev);
      visibleIds.forEach((id) => (checked ? next.add(id) : next.delete(id)));
      return next;
    });
  };

  const toggleOne = (id, checked, row) => {
    onToggleRow?.(id, checked, row);
    if (controlledSelectedIds) return;
    setInternalSelected((prev) => {
      const next = new Set(prev);
      checked ? next.add(id) : next.delete(id);
      return next;
    });
  };

  return (
    <div className={clsx("grid gap-0", className)}>
      {(searchableKeys.length > 0 || toolbarLeft || toolbarRight) && (
        <TableToolbar
          left={
            <div className="flex flex-wrap items-center gap-2">
              {searchableKeys.length > 0 && (
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--lb-muted)]" />
                  <input
                    className="lb-reset h-10 w-64 rounded-[var(--lb-radius-md)] border border-[color:var(--lb-border)] bg-[color:var(--lb-surface)] px-9 text-sm text-[color:var(--lb-text)] placeholder:text-[color:var(--lb-placeholder)] shadow-[var(--lb-shadow-xs)] focus:outline-none focus-visible:border-[color:var(--lb-primary-600)] focus-visible:shadow-[var(--lb-focus-ring)]"
                    placeholder="Search..."
                    value={query}
                    onChange={(event) => {
                      setInternalPage(1);
                      setQuery(event.target.value);
                    }}
                  />
                </div>
              )}
              {toolbarLeft}
            </div>
          }
          right={toolbarRight}
        />
      )}

      <Table className={className}>
        <THead sticky={stickyHeader}>
          <tr>
            {selectable && (
              <TH width={52} className="!px-5">
                <input
                  type="checkbox"
                  aria-label="Select all rows on page"
                  checked={allChecked}
                  ref={(el) => {
                    if (el) el.indeterminate = someChecked;
                  }}
                  onChange={(event) => toggleAll(event.target.checked)}
                  className="h-4 w-4 rounded-[var(--lb-radius-xs)] accent-[color:var(--lb-primary-600)]"
                />
              </TH>
            )}

            {columns
              .filter((column) => !column.selection)
              .map((column) => (
                <TH
                  key={column.id}
                  width={column.width}
                  align={column.align}
                  className={clsx(
                    column.sortable && "cursor-pointer select-none",
                    column.headerClassName
                  )}
                  onClick={() => toggleSort(column.id, column.sortable)}
                >
                  <span className="inline-flex items-center">
                    {column.header}
                    {column.sortable && (
                      <SortIcon
                        dir={
                          sort?.id === column.id
                            ? sort.desc
                              ? "desc"
                              : "asc"
                            : undefined
                        }
                      />
                    )}
                  </span>
                </TH>
              ))}
          </tr>
        </THead>

        <TBody>
          {loading && skeleton}
          {loading && !skeleton && (
            <tr>
              <TD colSpan={columns.length + (selectable ? 1 : 0)}>
                <div className="p-8 text-center text-[color:var(--lb-muted)]">
                  Loading...
                </div>
              </TD>
            </tr>
          )}

          {!loading && pageRows.length === 0 && (
            <tr>
              <TD colSpan={columns.length + (selectable ? 1 : 0)}>
                {emptyState || (
                  <div className="p-8 text-center text-[color:var(--lb-muted)]">
                    No rows found.
                  </div>
                )}
              </TD>
            </tr>
          )}

          {!loading &&
            pageRows.map((row, index) => {
              const id = getRowId(row, index, rowKey);
              return (
                <TR key={id}>
                  {selectable && (
                    <TD className="!px-5">
                      <input
                        type="checkbox"
                        aria-label={`Select row ${index + 1}`}
                        checked={selectedIds.has(id)}
                        onChange={(event) =>
                          toggleOne(id, event.target.checked, row)
                        }
                        className="h-4 w-4 rounded-[var(--lb-radius-xs)] accent-[color:var(--lb-primary-600)]"
                      />
                    </TD>
                  )}

                  {columns
                    .filter((column) => !column.selection)
                    .map((column) => {
                      const accessor = column.accessor || ((item) => item?.[column.id]);
                      const value = accessor(row);
                      const content = column.cell ? column.cell(value, row) : value;
                      return (
                        <TD
                          key={column.id}
                          align={column.align}
                          className={column.cellClassName}
                        >
                          {content}
                        </TD>
                      );
                    })}
                </TR>
              );
            })}
        </TBody>
      </Table>

      {!hidePagination && (
        <div className="flex flex-col gap-2 rounded-b-[var(--lb-radius-xl)] border border-t-0 border-[color:var(--lb-border)] bg-[color:var(--lb-surface)] sm:flex-row sm:items-center sm:justify-between">
          <div className="px-5 py-3 text-sm text-[color:var(--lb-muted)]">
            {total === 0
              ? "No records"
              : `Showing ${(page - 1) * pageSize + 1}-${Math.min(
                  page * pageSize,
                  total
                )} of ${total}`}
          </div>
          <Pagination page={page} pages={pages} onPage={setPage} />
        </div>
      )}
    </div>
  );
}

function normalizeSort(sort) {
  if (!sort) return null;
  if (sort.dir) return { id: sort.id, desc: sort.dir === "desc" };
  return sort;
}

function comparableValue(value) {
  if (React.isValidElement(value)) return null;
  return value;
}

function getRowId(row, index, rowKey) {
  if (typeof rowKey === "function") return rowKey(row, index);
  if (rowKey && row?.[rowKey] != null) return row[rowKey];
  return row?._id ?? row?.id ?? index;
}
