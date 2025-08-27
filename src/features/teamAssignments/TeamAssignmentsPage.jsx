import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchTeam, assignUser, removeUser } from "@/store/teamSlice";

// Skeleton barrels
import { Button, Drawer, ConfirmDialog, useToast } from "@/components/common";
import { FormField, Input, Select } from "@/components/form";
import { DataTable, TableToolbar } from "@/components/table";

/**
 * TeamAssignmentsPage (skeleton‑first)
 * - Uses shared Table (DataTable + TableToolbar)
 * - Uses shared Drawer + Form for invite/edit
 * - Wires to teamSlice (fetchTeam / assignUser / removeUser)
 *
 * Notes:
 * - fetchTeam(caseId) currently requires a caseId. For now, we keep a selectable caseId input
 *   at the top. If your backend exposes a firm‑wide team endpoint, you can remove caseId.
 */
export default function TeamAssignmentsPage() {
  const dispatch = useDispatch();
  const toast = useToast?.();
  const { members = [], loading, error } = useSelector((s) => s.team || {});

  // Filters + table state
  const [filters, setFilters] = useState({ q: "", role: "", status: "" });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sort, setSort] = useState(null);

  // Case scope (needed by fetchTeam)
  const [caseId, setCaseId] = useState("");

  // Drawer state
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null); // null = create (invite), obj = edit

  // Confirm dialogs
  const [confirmDelete, setConfirmDelete] = useState(null); // userId | null

  // Local form model for invite/edit
  const emptyUser = { name: "", email: "", role: "Attorney", status: "Invited" };
  const [form, setForm] = useState(emptyUser);

  useEffect(() => {
    if (!caseId) return; // don't fetch until a case is chosen
    dispatch(fetchTeam(caseId));
  }, [dispatch, caseId]);

  const rows = useMemo(() => (Array.isArray(members) ? members : []).map((m) => ({
    id: m._id || m.id,
    name: m.name || m.fullName || "—",
    email: m.email || m.username || "—",
    role: m.role || m.title || "Attorney",
    status: m.status || (m.invited ? "Invited" : "Active"),
    clients: arr(m.clients).join(", ") || "—",
    cases: arr(m.cases).join(", ") || "—",
    _raw: m,
  })), [members]);

  const filtered = useMemo(() => {
    let r = [...rows];
    const q = filters.q?.toLowerCase() || "";
    if (q) r = r.filter((x) => String(x.name).toLowerCase().includes(q) || String(x.email).toLowerCase().includes(q));
    if (filters.role) r = r.filter((x) => String(x.role).toLowerCase() === filters.role);
    if (filters.status) r = r.filter((x) => String(x.status).toLowerCase() === filters.status);
    if (sort) {
      const { id, desc } = sort;
      r.sort((a, b) => compare(getCell(a, id), getCell(b, id), desc));
    }
    return r;
  }, [rows, filters, sort]);

  const total = filtered.length;
  const pageRows = useMemo(() => filtered.slice((page - 1) * pageSize, page * pageSize), [filtered, page, pageSize]);

  const columns = [
    { id: "name", header: "Name", accessor: (r) => (
      <button className="text-[color:var(--lb-primary-700)] hover:underline" onClick={() => openEdit(r)}>{r.name}</button>
    ), sortable: true },
    { id: "email", header: "Email", accessor: (r) => r.email, sortable: true, width: 260 },
    { id: "role", header: "Role", accessor: (r) => r.role, sortable: true, width: 140 },
    { id: "status", header: "Status", accessor: (r) => r.status, sortable: true, width: 140 },
    { id: "clients", header: "Clients", accessor: (r) => r.clients, width: 220 },
    { id: "cases", header: "Cases", accessor: (r) => r.cases, width: 220 },
  ];

  function getCell(row, id) {
    switch (id) {
      case "name": return row.name;
      case "email": return row.email;
      case "role": return row.role;
      case "status": return row.status;
      default: return row[id];
    }
  }

  function openCreate() {
    setEditing(null); setForm(emptyUser); setOpen(true);
  }
  function openEdit(row) {
    setEditing(row);
    setForm({ name: row.name || "", email: row.email || "", role: row.role || "Attorney", status: row.status || "Active" });
    setOpen(true);
  }

  async function onSubmit(e) {
    e.preventDefault();
    const payload = { ...form, caseId };
    await dispatch(assignUser(payload));
    toast?.addToast?.({ tone: "success", title: editing ? "Updated" : "Invited", description: editing ? "Assignment updated." : "User invited/assigned." });
    setOpen(false);
    dispatch(fetchTeam(caseId));
  }

  async function onDelete(userId) {
    await dispatch(removeUser({ caseId, userId }));
    toast?.addToast?.({ tone: "success", title: "Removed", description: "User removed from case." });
    setConfirmDelete(null);
    dispatch(fetchTeam(caseId));
  }

  return (
    <div className="lb-reset p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Team Assignments</h1>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => caseId && dispatch(fetchTeam(caseId))}>Refresh</Button>
          <Button onClick={openCreate} disabled={!caseId}>Invite / Assign</Button>
        </div>
      </div>

      <TableToolbar>
        <Input
          placeholder="Filter by name/email…"
          value={filters.q}
          onChange={(e) => { setPage(1); setFilters({ ...filters, q: e.target.value }); }}
        />
        <Select value={filters.role} onChange={(e) => { setPage(1); setFilters({ ...filters, role: e.target.value }); }}>
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="attorney">Attorney</option>
          <option value="paralegal">Paralegal</option>
          <option value="billing">Billing</option>
        </Select>
        <Select value={filters.status} onChange={(e) => { setPage(1); setFilters({ ...filters, status: e.target.value }); }}>
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="invited">Invited</option>
          <option value="suspended">Suspended</option>
        </Select>
        <Input
          placeholder="Case ID (required)"
          value={caseId}
          onChange={(e) => setCaseId(e.target.value)}
          style={{ maxWidth: 220 }}
        />
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
        rowKey={(r) => r.id}
        loading={!!loading}
        stickyHeader
        rowActions={(r) => (
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => openEdit(r)}>Edit</Button>
            <Button variant="danger" size="sm" onClick={() => setConfirmDelete(r.id)}>Remove</Button>
          </div>
        )}
      />

      <Drawer open={open} onClose={() => setOpen(false)} title={editing ? "Edit Assignment" : "Invite / Assign User"}>
        <form onSubmit={onSubmit} className="space-y-4">
          <FormField label="Full Name" required>
            {({ inputId }) => (
              <Input id={inputId} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            )}
          </FormField>
          <FormField label="Email" required>
            {({ inputId }) => (
              <Input id={inputId} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            )}
          </FormField>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Role">
              {({ inputId }) => (
                <Select id={inputId} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                  <option>Attorney</option>
                  <option>Paralegal</option>
                  <option>Billing</option>
                  <option>Admin</option>
                </Select>
              )}
            </FormField>
            <FormField label="Status">
              {({ inputId }) => (
                <Select id={inputId} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option>Invited</option>
                  <option>Active</option>
                  <option>Suspended</option>
                </Select>
              )}
            </FormField>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" type="button" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={!caseId}>Save</Button>
          </div>
        </form>
      </Drawer>

      <ConfirmDialog
        open={!!confirmDelete}
        onCancel={() => setConfirmDelete(null)}
        onConfirm={() => onDelete(confirmDelete)}
        title="Remove this user from the case?"
        description="This action cannot be undone."
        confirmText="Remove"
        variant="danger"
      />

      {error && <div className="lb-error mt-3">{String(error)}</div>}
    </div>
  );
}

// ----- utils -----
function arr(v){ return Array.isArray(v) ? v : (v ? [v] : []); }
function compare(a,b,desc){ if(a==null && b==null) return 0; if(a==null) return desc?1:-1; if(b==null) return desc?-1:1; if(typeof a==="number" && typeof b==="number") return desc? b-a : a-b; return desc? String(b).localeCompare(String(a)) : String(a).localeCompare(String(b)); }
