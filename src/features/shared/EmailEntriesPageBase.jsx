import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchEmails, addEmail, pushClio } from "@/store/emailSlice";

// skeleton barrels
import { Button, Drawer, useToast } from "@/components/common";
import { Input, Select, DatePicker } from "@/components/form";
import { DataTable, TableToolbar } from "@/components/table";

/* ---------------- Role & Permission helpers (RBAC) ---------------- */
function derivePermissions(role, explicitReadOnly = false) {
  const r = String(role || "intern").toLowerCase();
  const isAdmin = r === "admin";
  const isPartner = r === "partner";
  const isLawyer = r === "lawyer";
  const isAssociate = r === "associate";
  const isIntern = r === "intern";

  const canEdit = isAdmin || isPartner || isLawyer;
  const canApprove = isAdmin || isPartner;
  const canInvoice = isAdmin || isPartner;
  const canDelete = isAdmin;
  const canViewAnalytics = isAdmin || isPartner;
  const readOnly = !!explicitReadOnly || isIntern || isAssociate;

  // scope: "all" | "team" | "self"
  const scope = isAdmin ? "all" : isPartner ? "team" : "self";

  return { isAdmin, isPartner, isLawyer, isAssociate, isIntern, canEdit, canApprove, canInvoice, canDelete, canViewAnalytics, readOnly, scope };
}

/* ---------------- Main Page ---------------- */
export default function EmailEntriesPage({
  role = "intern",
  readOnly = false,
  filters: _externalFilters = {},
  mode, // reserved
  currentUserId,
} = {}) {
  const perms = derivePermissions(role, readOnly);

  const dispatch = useDispatch();
  const toast = useToast?.();

  const { list = [], loading, error } = useSelector((s) => s.emails || {});

  // table state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sort, setSort] = useState(null); // { id, desc }
  const [filters, setFilters] = useState({ q: "", status: "", from: "", to: "" });

  // drawer state (avoid prop collision)
  const [open, setOpen] = useState(false);
  const [viewMode, setViewMode] = useState("create"); // create | view
  const [editing, setEditing] = useState(null);

  // form model
  const empty = { subject: "", clientName: "", caseName: "", minutes: "", date: "", status: "Logged", summary: "" };
  const [form, setForm] = useState(empty);

  useEffect(() => { dispatch(fetchEmails()); }, [dispatch]);

  // normalize rows defensively
  const rows = useMemo(() => (Array.isArray(list) ? list : []).map((e) => ({
    id: e._id || e.id,
    subject: e.subject || e.threadSubject || "(no subject)",
    clientName: e.clientName || e.client?.name || e.client || "—",
    caseName: e.caseName || e.case?.title || e.case || "—",
    minutes: Number(e.typingTimeMinutes ?? e.durationMinutes ?? e.minutes ?? e.duration ?? 0),
    date: e.date || e.createdAt || null,
    status: e.status || "Logged",
    summary: e.summary || e.description || "",
    _raw: e,
  })), [list]);

  // filter/sort client-side for now
  const filtered = useMemo(() => {
    let r = [...rows];
    const q = filters.q?.toLowerCase() || "";
    if (q) r = r.filter((x) => (
      String(x.subject).toLowerCase().includes(q) ||
      String(x.clientName).toLowerCase().includes(q) ||
      String(x.caseName).toLowerCase().includes(q) ||
      String(x.summary).toLowerCase().includes(q)
    ));
    if (filters.status) r = r.filter((x) => String(x.status).toLowerCase() === filters.status);
    if (filters.from) r = r.filter((x) => safeDate(x.date) >= safeDate(filters.from));
    if (filters.to)   r = r.filter((x) => safeDate(x.date) <= safeDate(filters.to));
    if (sort) {
      const { id, desc } = sort;
      r.sort((a, b) => compare(getCell(a, id), getCell(b, id), desc));
    }
    return r;
  }, [rows, filters, sort]);

  const total = filtered.length;
  const pageRows = useMemo(() => filtered.slice((page - 1) * pageSize, page * pageSize), [filtered, page, pageSize]);

  const columns = [
    { id: "subject", header: "Subject", accessor: (r) => (
      <button className="text-[color:var(--lb-primary-700)] hover:underline" onClick={() => openView(r)}>{r.subject}</button>
    ), sortable: true },
    { id: "client", header: "Client", accessor: (r) => r.clientName, sortable: true, width: 220 },
    { id: "case", header: "Case", accessor: (r) => r.caseName, sortable: true, width: 220 },
    { id: "minutes", header: "Minutes", accessor: (r) => r.minutes, align: "right", sortable: true, width: 120 },
    { id: "date", header: "Date", accessor: (r) => fmtDate(r.date), sortable: true, width: 140 },
    { id: "status", header: "Status", accessor: (r) => r.status, sortable: true, width: 120 },
    {
      id: "actions",
      header: "Actions",
      accessor: (row) => (
        <Button
          variant="secondary"
          size="sm"
          onClick={(e) => { e.stopPropagation(); dispatch(pushClio(row.id)); }}
          disabled={!!row._raw?.meta?.clioPushed}
        >
          {row._raw?.meta?.clioPushed ? "Pushed" : "Push to Clio"}
        </Button>
      ),
      width: 140,
      sortable: false,
    },
  ];

  function getCell(row, id) {
    switch (id) {
      case "subject": return row.subject;
      case "client": return row.clientName;
      case "case": return row.caseName;
      case "minutes": return Number(row.minutes || 0);
      case "date": return safeDate(row.date);
      case "status": return row.status || "";
      default: return row[id];
    }
  }

  function openCreate() {
    setViewMode("create");
    setEditing(null);
    setForm(empty);
    setOpen(true);
  }

  function openView(row) {
    setViewMode("view");
    setEditing(row);
    setForm({
      subject: row.subject || "",
      clientName: row.clientName || "",
      caseName: row.caseName || "",
      minutes: row.minutes || "",
      date: row.date || "",
      status: row.status || "Logged",
      summary: row.summary || "",
    });
    setOpen(true);
  }

  async function onSubmit(e) {
    e.preventDefault();
    const payload = uiToPayload(form);
    await dispatch(addEmail(payload));
    toast?.addToast?.({ tone: "success", title: "Logged", description: "Email entry added." });
    setOpen(false);
    dispatch(fetchEmails());
  }

  return (
    <div className="lb-reset p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Email Entries</h1>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => dispatch(fetchEmails())}>Refresh</Button>
          {!perms.readOnly && perms.canEdit && <Button onClick={openCreate}>New Entry</Button>}
        </div>
      </div>

      <TableToolbar>
        <Input
          placeholder="Search subject/client/case/summary…"
          value={filters.q}
          onChange={(e) => { setPage(1); setFilters({ ...filters, q: e.target.value }); }}
        />
        <Select
          value={filters.status}
          onChange={(e) => { setPage(1); setFilters({ ...filters, status: e.target.value }); }}
        >
          <option value="">All statuses</option>
          <option value="logged">Logged</option>
          <option value="failed">Failed</option>
          <option value="pending">Pending</option>
        </Select>
        <DatePicker label={null} placeholder="From" value={filters.from} onChange={(v) => { setPage(1); setFilters({ ...filters, from: v }); }} size="sm" />
        <DatePicker label={null} placeholder="To"   value={filters.to}   onChange={(v) => { setPage(1); setFilters({ ...filters, to: v }); }} size="sm" />
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
      />

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title={viewMode === "create" ? "New Email Entry" : "Email Details"}
      >
        {viewMode === "view" ? (
          <div className="space-y-3">
            <KV label="Subject" value={form.subject || "—"} />
            <KV label="Client" value={form.clientName || "—"} />
            <KV label="Case" value={form.caseName || "—"} />
            <KV label="Minutes" value={String(form.minutes || 0)} />
            <KV label="Date" value={fmtDate(form.date)} />
            <KV label="Status" value={form.status || "Logged"} />
            <div>
              <div className="text-[color:var(--lb-muted)] mb-1">Summary</div>
              <div className="whitespace-pre-wrap">{form.summary || "—"}</div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t mt-4">
              <Button variant="secondary" onClick={() => setOpen(false)}>
                Close
              </Button>
              <Button
                onClick={async (e) => {
                  e.stopPropagation();
                  await dispatch(pushClio(editing.id)).unwrap();
                  toast?.addToast?.({ tone: "success", title: "Pushed to Clio" });
                  dispatch(fetchEmails());
                }}
                disabled={!!editing?._raw?.meta?.clioPushed}
              >
                {editing?._raw?.meta?.clioPushed ? "Pushed" : "Push to Clio"}
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            {/* add form fields here */}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" type="button" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
        )}
      </Drawer>

      {error && <div className="lb-error mt-3">{String(error)}</div>}
    </div>
  );
}

/* ---------------- utils ---------------- */
function fmtDate(v){ if(!v) return "—"; try{ return new Date(v).toLocaleDateString(); } catch { return String(v); } }
function compare(a,b,desc){ if(a==null && b==null) return 0; if(a==null) return desc?1:-1; if(b==null) return desc?-1:1; if(typeof a==="number" && typeof b==="number") return desc? b-a : a-b; return desc? String(b).localeCompare(String(a)) : String(a).localeCompare(String(b)); }
function safeDate(v){ try { return new Date(v).getTime(); } catch { return 0; } }
function uiToPayload(f){
  return {
    subject: f.subject,
    clientName: f.clientName,
    caseName: f.caseName,
    minutes: Number(f.minutes) || 0,
    date: f.date || null,
    status: f.status,
    summary: f.billableSummary || f.summary || f.description || "",
  };
}
function KV({ label, value }){
  return (
    <div className="flex items-start justify-between gap-6">
      <span className="text-[color:var(--lb-muted)]">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

/* ---------------- Role-aware wrapper (named export) ---------------- */
export function EmailEntriesBase({
  role = "intern",
  readOnly = false,
  filters = {},
  mode,
  currentUserId,
  ...props
} = {}) {
  return (
    <EmailEntriesPage
      role={role}
      readOnly={readOnly}
      filters={filters}
      mode={mode}
      currentUserId={currentUserId}
      {...props}
    />
  );
}
