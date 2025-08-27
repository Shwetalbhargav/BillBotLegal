// src/pages/CaseDashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCases, createCase, editCase, removeCase } from "@/store/caseSlice";

// Project skeleton barrels
import { Button, Drawer, ConfirmDialog, useToast } from "@/components/common";
import { FormField, Input, TextArea, Select } from "@/components/form";
import { DataTable, TableToolbar, SkeletonRows } from "@/components/table";

export default function CaseDashboard() {
  const dispatch = useDispatch();
  const toast = useToast?.();
  const { list = [], loading, error } = useSelector((s) => s.cases || {});

  // table state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sort, setSort] = useState(null); // { id, desc }
  const [selectedIds, setSelectedIds] = useState([]);
  const [filters, setFilters] = useState({ q: "", status: "" });

  // drawer state
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("create"); // create | edit
  const [editing, setEditing] = useState(null);

  // form model
  const emptyCase = {
    name: "",
    description: "",
    clientId: "",
    status: "open",
    assignedUsers: [],
    primaryLawyerId: "",
  };
  const [form, setForm] = useState(emptyCase);

  useEffect(() => { dispatch(fetchCases()); }, [dispatch]);

  // normalize rows for table
  const rows = useMemo(() => (Array.isArray(list) ? list : []).map((c) => ({
    id: c._id || c.id,
    name: c.name || c.title || "—",
    description: c.description || "",
    clientId: typeof c.clientId === "object" ? (c.clientId?.name || c.clientId?._id) : (c.clientId || "—"),
    status: (c.status || "open").toLowerCase(),
    assignedUsers: Array.isArray(c.assignedUsers)
      ? c.assignedUsers.map(u => typeof u === "object" ? (u.name || u._id) : u)
      : [],
    primaryLawyerId: typeof c.primaryLawyerId === "object" ? (c.primaryLawyerId?.name || c.primaryLawyerId?._id) : (c.primaryLawyerId || ""),
    _raw: c,
  })), [list]);

  const filtered = useMemo(() => {
    let r = [...rows];
    const t = (filters.q || "").toLowerCase();
    if (t) {
      r = r.filter(x =>
        String(x.name).toLowerCase().includes(t) ||
        String(x.description).toLowerCase().includes(t) ||
        String(x.clientId).toLowerCase().includes(t)
      );
    }
    if (filters.status) r = r.filter(x => x.status === filters.status);
    if (sort) {
      const { id, desc } = sort;
      r.sort((a,b) => compare(getCell(a,id), getCell(b,id), desc));
    }
    return r;
  }, [rows, filters, sort]);

  const total = filtered.length;
  const pageRows = useMemo(
    () => filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page, pageSize]
  );

  const columns = [
    { id: "_sel", header: "", selection: true, width: 44 },
    {
      id: "name",
      header: "Case",
      accessor: (r) => (
        <button className="text-[color:var(--lb-primary-700)] hover:underline" onClick={() => openEdit(r)}>
          {r.name}
        </button>
      ),
      sortable: true,
      width: 260,
    },
    { id: "clientId", header: "Client", accessor: (r) => r.clientId, sortable: true, width: 220 },
    { id: "status", header: "Status", accessor: (r) => cap(r.status), sortable: true, width: 120 },
    { id: "assignedUsers", header: "Assigned", accessor: (r) => r.assignedUsers?.join(", ") || "—", width: 280 },
  ];

  function getCell(row, id) {
    switch (id) {
      case "name": return row.name;
      case "clientId": return row.clientId;
      case "status": return row.status;
      default: return row[id];
    }
  }

  function onToggleRow(id, checked) {
    setSelectedIds((prev) => (checked ? [...prev, id] : prev.filter((x) => x !== id)));
  }
  function onToggleAll(checked, ids) { setSelectedIds(checked ? ids : []); }

  function openCreate() {
    setMode("create");
    setEditing(null);
    setForm(emptyCase);
    setOpen(true);
  }
  function openEdit(row) {
    setMode("edit");
    setEditing(row);
    setForm({
      name: row.name || "",
      description: row.description || "",
      clientId: row._raw?.clientId?._id || row._raw?.clientId || "",
      status: row.status || "open",
      assignedUsers: Array.isArray(row._raw?.assignedUsers)
        ? row._raw.assignedUsers.map(u => (typeof u === "object" ? (u._id || "") : u)).filter(Boolean)
        : [],
      primaryLawyerId: typeof row._raw?.primaryLawyerId === "object"
        ? (row._raw.primaryLawyerId?._id || "")
        : (row._raw?.primaryLawyerId || ""),
    });
    setOpen(true);
  }

  async function onSubmit(e) {
    e.preventDefault();
    const payload = { ...form, status: form.status || "open" };
    if (mode === "create") {
      await dispatch(createCase(payload));
      toast?.addToast?.({ tone: "success", title: "Created", description: "Case added." });
    } else if (mode === "edit" && editing?.id) {
      await dispatch(editCase({ id: editing.id, caseData: payload }));
      toast?.addToast?.({ tone: "success", title: "Updated", description: "Case updated." });
    }
    setOpen(false);
    dispatch(fetchCases());
  }

  const [confirmDelete, setConfirmDelete] = useState(null);
  async function onDelete(id) {
    await dispatch(removeCase(id));
    toast?.addToast?.({ tone: "success", title: "Deleted", description: "Case removed." });
    setConfirmDelete(null);
    dispatch(fetchCases());
  }

  return (
    <div className="lb-reset p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Cases</h1>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => dispatch(fetchCases())}>Refresh</Button>
          <Button onClick={openCreate}>New Case</Button>
        </div>
      </div>

      <TableToolbar>
        <Input
          placeholder="Search case/client/desc…"
          value={filters.q}
          onChange={(e) => { setPage(1); setFilters({ ...filters, q: e.target.value }); }}
        />
        <Select
          value={filters.status}
          onChange={(e) => { setPage(1); setFilters({ ...filters, status: e.target.value }); }}
        >
          <option value="">All statuses</option>
          <option value="open">Open</option>
          <option value="pending">Pending</option>
          <option value="closed">Closed</option>
        </Select>
      </TableToolbar>

      <DataTable
        columns={columns}
        data={pageRows}
        total={total}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
        sort={sort}
        onSortChange={setSort}
        selectedIds={selectedIds}
        onToggleRow={onToggleRow}
        onToggleAll={onToggleAll}
        rowKey={(r) => r.id}
        loading={!!loading}
        stickyHeader
        skeleton={<SkeletonRows columns={columns} />}   // ← shows skeleton while loading
        rowActions={(r) => (
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => openEdit(r)}>Edit</Button>
            <Button variant="danger" size="sm" onClick={() => setConfirmDelete(r.id)}>Delete</Button>
          </div>
        )}
      />

      <Drawer open={open} onClose={() => setOpen(false)} title={mode === "create" ? "New Case" : "Edit Case"}>
        <form onSubmit={onSubmit} className="space-y-4">
          <FormField label="Case Name" required>
            {({ inputId }) => (
              <Input id={inputId} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            )}
          </FormField>

          <FormField label="Description">
            {({ inputId }) => (
              <TextArea id={inputId} rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            )}
          </FormField>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Client ID" required>
              {({ inputId }) => (
                <Input id={inputId} value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })} required />
              )}
            </FormField>
            <FormField label="Status">
              {({ inputId }) => (
                <Select id={inputId} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option value="open">Open</option>
                  <option value="pending">Pending</option>
                  <option value="closed">Closed</option>
                </Select>
              )}
            </FormField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Primary Lawyer User ID">
              {({ inputId }) => (
                <Input id={inputId} value={form.primaryLawyerId} onChange={(e) => setForm({ ...form, primaryLawyerId: e.target.value })} />
              )}
            </FormField>
            <FormField label="Assigned User IDs (comma‑separated)">
              {({ inputId }) => (
                <Input
                  id={inputId}
                  value={form.assignedUsers.join(",")}
                  onChange={(e) => setForm({ ...form, assignedUsers: toCsvArray(e.target.value) })}
                />
              )}
            </FormField>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" type="button" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Drawer>

      <ConfirmDialog
        open={!!confirmDelete}
        onCancel={() => setConfirmDelete(null)}
        onConfirm={() => onDelete(confirmDelete)}
        title="Delete this case?"
        description="This action cannot be undone."
        confirmText="Delete"
        variant="danger"
      />

      {error && <div className="mt-3 text-red-600">{String(error)}</div>}
    </div>
  );
}

// utils
function toCsvArray(s){
  return String(s || "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}
function cap(s){ return String(s||"").replace(/^./, (c)=>c.toUpperCase()); }
function compare(a,b,desc){
  if(a==null && b==null) return 0;
  if(a==null) return desc?1:-1;
  if(b==null) return desc?-1:1;
  if(typeof a==="number" && typeof b==="number") return desc? b-a : a-b;
  return desc ? String(b).localeCompare(String(a)) : String(a).localeCompare(String(b));
}
