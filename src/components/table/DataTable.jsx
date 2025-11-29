// src/components/table/DataTable.jsx
import React from "react";
import { Table, THead, TBody, TR, TH, TD } from "./Table";
import Pagination from "./Pagination";
import TableToolbar from "./TableToolbar";
import { clsx } from "../../utils/clsx";


function SortIcon({ dir }) {
return (
<span aria-hidden className="ml-1 inline-block select-none opacity-70">
{dir === "asc" ? "▲" : dir === "desc" ? "▼" : "▵"}
</span>
);
}
export default function DataTable({
  columns = [],
  rows = [],
  searchableKeys = [],
  initialSort,
  pageSize = 10,
  rowSelectable = false,
  onSelectionChange,
  toolbarLeft,
  toolbarRight,
  emptyState,
  className,
}) {

const [query, setQuery] = React.useState("");
const [page, setPage] = React.useState(1);
const [sort, setSort] = React.useState(initialSort || null);
const [selected, setSelected] = React.useState(new Set());


React.useEffect(() => { onSelectionChange?.(Array.from(selected)); }, [selected]);


const toggleSort = (id, sortable) => {
if (!sortable) return;
setPage(1);
setSort((prev) => {
if (!prev || prev.id !== id) return { id, dir: "asc" };
if (prev.dir === "asc") return { id, dir: "desc" };
return null; // off
});
};

const filtered = React.useMemo(() => {
const baseRows = Array.isArray(rows) ? rows : [];
if (!query) return baseRows;
const q = query.toLowerCase();
return baseRows.filter((r) =>
searchableKeys.some((k) => String(r[k] ?? "").toLowerCase().includes(q))
);
}, [rows, query, searchableKeys]);

const sorted = React.useMemo(() => {
if (!sort) return filtered;
const col = columns.find((c) => c.id === sort.id);
const acc = col?.accessor || ((row) => row[col.id]);
return [...filtered].sort((a, b) => {
const va = acc(a);
const vb = acc(b);
if (va == null && vb == null) return 0;
if (va == null) return -1;
if (vb == null) return 1;
if (va > vb) return sort.dir === "asc" ? 1 : -1;
if (va < vb) return sort.dir === "asc" ? -1 : 1;
return 0;
});
}, [filtered, sort, columns]);

const pages = Math.max(1, Math.ceil(sorted.length / pageSize));
const pageRows = sorted.slice((page - 1) * pageSize, page * pageSize);


const allOnPageIds = pageRows.map((r, i) => r.id ?? i);
const allChecked = rowSelectable && allOnPageIds.every((id) => selected.has(id));
const someChecked = rowSelectable && !allChecked && allOnPageIds.some((id) => selected.has(id));


const toggleAll = () => {
setSelected((prev) => {
const next = new Set(prev);
if (allChecked) {
allOnPageIds.forEach((id) => next.delete(id));
} else {
allOnPageIds.forEach((id) => next.add(id));
}
return next;
});
};

const toggleOne = (id) => {
setSelected((prev) => {
const next = new Set(prev);
next.has(id) ? next.delete(id) : next.add(id);
return next;
});
};

return (
<div className={clsx("grid gap-0", className)}>
<TableToolbar
left={
<div className="flex items-center gap-2">
<input
className={"h-9 w-64 rounded-[var(--lb-radius-md)] border border-[color:var(--lb-border)] bg-[color:var(--lb-bg)] px-3 text-sm shadow-[var(--lb-shadow-xs)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--lb-primary-600)]"}
placeholder="Search…"
value={query}
onChange={(e) => { setPage(1); setQuery(e.target.value); }}
/>
{toolbarLeft}
</div>
}
right={toolbarRight}
/>

<Table>
<THead>
<tr>
{rowSelectable && (
<TH width={36} className="!px-2">
<input
type="checkbox"
aria-label="Select all on page"
checked={allChecked}
ref={(el) => el && (el.indeterminate = someChecked)}
onChange={toggleAll}
className="h-4 w-4 rounded border-[color:var(--lb-border)]"
/>
</TH>
)}
{columns.map((c) => (
<TH key={c.id} width={c.width} align={c.align}
className={clsx(c.sortable && "cursor-pointer select-none")}
onClick={() => toggleSort(c.id, c.sortable)}>
<span className="inline-flex items-center">
{c.header}
{c.sortable && <SortIcon dir={sort?.id === c.id ? sort.dir : undefined} />}
</span>
</TH>
))}
</tr>
</THead>


<TBody>
{pageRows.length === 0 && (
<tr>
<TD colSpan={(columns?.length || 0) + (rowSelectable ? 1 : 0)}>
{emptyState || (
<div className="p-8 text-center text-[color:var(--lb-muted)]">No rows found.</div>
)}
</TD>
</tr>
)}
{pageRows.map((row, i) => {
const id = row.id ?? i;
return (
<TR key={id}>
{rowSelectable && (
<TD className="!px-2">
<input
type="checkbox"
aria-label={`Select row ${i + 1}`}
checked={selected.has(id)}
onChange={() => toggleOne(id)}
className="h-4 w-4 rounded border-[color:var(--lb-border)]"
/>
</TD>
)}

{columns.map((c) => {
const acc = c.accessor || ((r) => r[c.id]);
const value = acc(row);
const content = c.cell ? c.cell(value, row) : value;
return (
<TD key={c.id} align={c.align}>
{content}
</TD>
);
})}
</TR>
);
})}
</TBody>
</Table>

<div className="flex items-center justify-between border border-t-0 border-[color:var(--lb-border)] rounded-b-[var(--lb-radius-xl)] bg-[color:var(--lb-bg)]">
<div className="px-3 py-2 text-sm text-[color:var(--lb-muted)]">
Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, sorted.length)} of {sorted.length}
</div>
<Pagination page={page} pages={pages} onPage={setPage} />
</div>
</div>
);
}