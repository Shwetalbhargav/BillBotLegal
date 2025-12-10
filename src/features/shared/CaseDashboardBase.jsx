// src/features/shared/CaseDashboard.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Plus,
  RefreshCcw,
  Pencil,
  Trash2,
  Briefcase,
  User,
  Users,
  Tag,
  Gavel,
  CircleDot,
  Clock,
  CircleDollarSign,
  Search,
  Save,
  X,
  AlignLeft,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCases,
  createCase,
  editCase,
  removeCase,
} from "@/store/caseSlice";
import {
  getBillableAnalytics,
  listClients,
  listCaseTypes,
} from "@/services/api";
import {
  fetchUsersThunk,
  selectUsers,
  selectUsersLoading,
} from "@/store/usersSlice.js";
import { Button, ConfirmDialog, useToast } from "@/components/common";
import { Input, Select } from "@/components/form";
import { DataTable, TableToolbar, SkeletonRows } from "@/components/table";

/* ----------------------------- Draggable Modal ---------------------------- */
function DraggableShell({ children, onClose, title }) {
  const shellRef = useRef(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [drag, setDrag] = useState(null);

  function onMouseDown(e) {
    if (!(e.target.closest && e.target.closest("[data-drag-handle]"))) return;
    const rect = shellRef.current.getBoundingClientRect();
    setDrag({ dx: e.clientX - rect.left, dy: e.clientY - rect.top });
  }
  function onMouseMove(e) {
    if (!drag) return;
    setPos({ x: e.clientX - drag.dx, y: e.clientY - drag.dy });
  }
  function onMouseUp() {
    setDrag(null);
  }

  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [drag]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        ref={shellRef}
        onMouseDown={onMouseDown}
        style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}
        className="relative w-[760px] max-w-[95vw] rounded-[1.75rem] bg-[color:var(--lb-surface,#ffffff)] shadow-[0_24px_70px_rgba(15,23,42,0.35)] border border-[color:var(--lb-border,#e5e7eb)] overflow-hidden"
      >
        <div
          data-drag-handle
          className="cursor-move select-none bg-gradient-to-r from-slate-50 to-slate-100 px-5 py-3 flex items-center justify-between"
        >
          <div className="font-semibold text-sm flex items-center gap-2">
            <Briefcase size={16} />
            <span>{title}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white shadow-[0_6px_18px_rgba(15,23,42,0.15)]"
          >
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ------------------------------ Case Form Modal ------------------------------ */
function CaseFormModal({
  open,
  onClose,
  onSave,
  initial,
  users = [],
  usersLoading,
}) {
  const [form, setForm] = useState(() => ({
    name: "",
    description: "",
    client_id: "",
    status: "open",
    primary_lawyer_user_id: "",
    assigned_user_ids: "",
    case_type: "",
    case_type_id: "",
    ...initial,
  }));
  const [clients, setClients] = useState([]);
  const [caseTypes, setCaseTypes] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        const [{ data: clientsData }, { data: typesData }] = await Promise.all(
          [listClients(), listCaseTypes()]
        );
        setClients(
          Array.isArray(clientsData) ? clientsData : clientsData?.items || []
        );
        setCaseTypes(
          Array.isArray(typesData) ? typesData : typesData?.items || []
        );
      } catch (e) {
        console.error("Failed to load dropdown data", e);
      }
    })();
  }, [open]);

  useEffect(() => {
    if (initial && open)
      setForm((s) => ({
        ...s,
        ...initial,
      }));
  }, [initial, open]);

  if (!open) return null;

  function update(k, v) {
    setForm((s) => ({ ...s, [k]: v }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const payload = {
        ...form,
        assigned_user_ids: Array.isArray(form.assigned_user_ids)
          ? form.assigned_user_ids
          : String(form.assigned_user_ids || "")
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean),
      };
      await onSave(payload);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <DraggableShell
      title={initial?._id ? "Edit Case" : "Create New Case"}
      onClose={onClose}
    >
      <div className="max-h-[75vh] overflow-auto px-5 pb-5 pt-4 bg-[color:var(--lb-surface,#ffffff)]">
        <div className="mb-4 text-xs text-[color:var(--lb-muted,#6b7280)]">
          Capture key details about the matter so your team can track work,
          owners, and billing.
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--lb-muted)]">
              <Briefcase size={14} /> Case Name{" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              className="w-full rounded-2xl border border-[color:var(--lb-border)] bg-[color:var(--lb-surface)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--lb-primary-300)]"
              value={form.name || ""}
              onChange={(e) => update("name", e.target.value)}
              placeholder="e.g., Tax Audit – Wilson & Co."
              required
            />
          </div>

          <div>
            <label className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--lb-muted)]">
              <AlignLeft size={14} /> Description
            </label>
            <textarea
              className="min-h-[90px] w-full rounded-2xl border border-[color:var(--lb-border)] bg-[color:var(--lb-surface)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--lb-primary-300)]"
              value={form.description || ""}
              onChange={(e) => update("description", e.target.value)}
              placeholder="Short internal summary or notes about this matter."
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--lb-muted)]">
                <User size={14} /> Client{" "}
                <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full rounded-2xl border border-[color:var(--lb-border)] bg-[color:var(--lb-surface)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--lb-primary-300)]"
                value={form.client_id || ""}
                onChange={(e) => update("client_id", e.target.value)}
                required
              >
                <option value="">Select client</option>
                {clients.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name || c.clientName || c.company || c.email}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--lb-muted)]">
                <CircleDot size={14} /> Status
              </label>
              <select
                className="w-full rounded-2xl border border-[color:var(--lb-border)] bg-[color:var(--lb-surface)] px-3 py-2 text-sm capitalize focus:outline-none focus:ring-2 focus:ring-[color:var(--lb-primary-300)]"
                value={form.status || "open"}
                onChange={(e) => update("status", e.target.value)}
              >
                <option value="open">Open</option>
                <option value="on_hold">On hold</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--lb-muted)]">
                <Gavel size={14} /> Primary Lawyer
              </label>
              <select
                className="w-full rounded-2xl border border-[color:var(--lb-border)] bg-[color:var(--lb-surface)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--lb-primary-300)]"
                value={form.primary_lawyer_user_id || ""}
                onChange={(e) =>
                  update("primary_lawyer_user_id", e.target.value)
                }
                disabled={usersLoading}
              >
                <option value="">
                  {usersLoading ? "Loading users…" : "Select primary lawyer"}
                </option>
                {users
                  .filter((u) =>
                    ["lawyer", "partner"].includes(String(u.role))
                  )
                  .map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name} — {u.email}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--lb-muted)]">
                <Users size={14} /> Assigned Users
              </label>
              <select
                multiple
                className="w-full rounded-2xl border border-[color:var(--lb-border)] bg-[color:var(--lb-surface)] px-3 py-2 text-sm min-h-[120px] focus:outline-none focus:ring-2 focus:ring-[color:var(--lb-primary-300)]"
                value={
                  Array.isArray(form.assigned_user_ids)
                    ? form.assigned_user_ids
                    : String(form.assigned_user_ids || "")
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean)
                }
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions).map(
                    (o) => o.value
                  );
                  update("assigned_user_ids", selected);
                }}
                disabled={usersLoading}
              >
                {usersLoading && <option>Loading users…</option>}
                {!usersLoading &&
                  users.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name} — {u.email} ({u.role})
                    </option>
                  ))}
              </select>
              <p className="mt-1 text-[0.7rem] text-[color:var(--lb-muted)]">
                Tip: Hold <strong>Ctrl</strong> / <strong>Cmd</strong> to
                select multiple team members.
              </p>
            </div>
          </div>

          <div>
            <label className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--lb-muted)]">
              <Tag size={14} /> Case Type
            </label>
            <select
              className="w-full rounded-2xl border border-[color:var(--lb-border)] bg-[color:var(--lb-surface)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--lb-primary-300)]"
              value={form.case_type_id || form.case_type || ""}
              onChange={(e) => {
                const val = e.target.value;
                const isId = caseTypes.some(
                  (t) => String(t._id) === String(val)
                );
                update(isId ? "case_type_id" : "case_type", val);
                if (isId) update("case_type", "");
              }}
            >
              <option value="">Select type</option>
              {caseTypes.map((t) => (
                <option key={t._id || t.value} value={t._id || t.value}>
                  {t.name || t.label || t.value}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-full border border-[color:var(--lb-border)] bg-white px-4 py-2 text-sm hover:bg-slate-50"
            type="button"
          >
            Cancel
          </button>
          <button
            disabled={saving}
            onClick={handleSave}
            className="inline-flex items-center gap-2 rounded-full bg-[color:var(--lb-primary-600)] px-4 py-2 text-sm font-medium text-white shadow-[0_12px_26px_rgba(37,99,235,0.55)] hover:bg-[color:var(--lb-primary-700)] disabled:opacity-60"
            type="button"
          >
            <Save size={16} />
            {saving ? "Saving…" : "Save case"}
          </button>
        </div>
      </div>
    </DraggableShell>
  );
}

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

  const scope = isAdmin ? "all" : isPartner ? "team" : "self";
  return {
    isAdmin,
    isPartner,
    isLawyer,
    isAssociate,
    isIntern,
    canEdit,
    canApprove,
    canInvoice,
    canDelete,
    canViewAnalytics,
    readOnly,
    scope,
  };
}

export default function CaseDashboard(
  { role = "intern", readOnly = false, filters: externalFilters = {}, mode, currentUserId } = {}
) {
  const perms = derivePermissions(role, readOnly);
  const dispatch = useDispatch();
  const toast = useToast?.();
  const { list = [], loading, error } = useSelector((s) => s.cases || {});
  const users = useSelector(selectUsers);
  const usersLoading = useSelector(selectUsersLoading);

  const [filters, setFilters] = useState({ q: "", status: "" });
  const [debouncedQ, setDebouncedQ] = useState("");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sort, setSort] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    dispatch(fetchCases());
  }, [dispatch]);
  useEffect(() => {
    if (!formOpen) return;
    dispatch(fetchUsersThunk({ limit: 200, sort: "name" }));
  }, [formOpen, dispatch]);

  useEffect(() => {
    const h = setTimeout(() => setDebouncedQ((filters.q || "").trim()), 350);
    return () => clearTimeout(h);
  }, [filters.q]);

  useEffect(() => {
    dispatch(fetchCases({ q: debouncedQ }));
  }, [debouncedQ, dispatch]);

  const [billedByCase, setBilledByCase] = useState({});
  useEffect(() => {
    (async () => {
      try {
        const res = await getBillableAnalytics();
        const arr = Array.isArray(res?.data?.items)
          ? res.data.items
          : Array.isArray(res?.data)
          ? res.data
          : [];
        const map = {};
        for (const it of arr) {
          const key =
            it?.caseId?._id || it?.caseId || it?.case || it?.caseTitle;
          if (!key) continue;
          const hrs =
            typeof it?.durationHours === "number"
              ? it.durationHours
              : Number(it?.durationMinutes || 0) / 60;
          const amt = Number(
            it?.amount || hrs * Number(it?.rate || 0) || 0
          );
          map[key] = map[key] || { hours: 0, amount: 0 };
          map[key].hours += isFinite(hrs) ? hrs : 0;
          map[key].amount += isFinite(amt) ? amt : 0;
        }
        setBilledByCase(map);
      } catch (e) {
        console.error("billed load failed", e);
      }
    })();
  }, []);

  const rows = useMemo(() => {
    const src = Array.isArray(list) ? list : [];
    return src.map((c) => {
      const id = c._id || c.id;
      const clientStr =
        typeof c.clientId === "object"
          ? c.clientId?.name || c.clientId?._id
          : c.clientId || "—";
      const caseKey = c?._id || c?.title || c?.name;
      const billed =
        billedByCase[caseKey] ||
        billedByCase[c?.title] ||
        billedByCase[c?._id] || { amount: 0, hours: 0 };
      return {
        id,
        name: c.name || c.title || "—",
        description: c.description || "",
        clientId: clientStr,
        status: String(c.status || "open").toLowerCase(),
        assignedUsers: Array.isArray(c.assignedUsers)
          ? c.assignedUsers.map((u) =>
              typeof u === "object" ? u.name || u._id : u
            )
          : [],
        primaryLawyer:
          typeof c.primaryLawyerId === "object"
            ? c.primaryLawyerId?.name || c.primaryLawyerId?._id
            : c.primaryLawyerId || "—",
        caseType: c.case_type || c.caseType || c.type || "—",
        billedAmount: billed.amount,
        billedHours: billed.hours,
        _raw: c,
      };
    });
  }, [list, billedByCase]);

  const filteredRows = useMemo(() => {
    let r = [...rows];
    const t = (filters.q || "").toLowerCase();
    if (t) {
      r = r.filter(
        (x) =>
          String(x.name).toLowerCase().includes(t) ||
          String(x.description).toLowerCase().includes(t) ||
          String(x.clientId).toLowerCase().includes(t)
      );
    }
    if (filters.status) r = r.filter((x) => x.status === filters.status);
    if (sort) {
      const { id, desc } = sort;
      r.sort((a, b) => compare(getCell(a, id), getCell(b, id), desc));
    }
    return r;
  }, [rows, filters, sort]);

  const total = filteredRows.length;
  const pageRows = useMemo(
    () => filteredRows.slice((page - 1) * pageSize, page * pageSize),
    [filteredRows, page, pageSize]
  );

  const columns = [
    { id: "_sel", header: "", selection: true, width: 44 },
    {
      id: "name",
      header: (
        <div className="inline-flex items-center gap-2">
          <Briefcase size={16} /> <span>Case</span>
        </div>
      ),
      accessor: (r) => (
        <button
          className="text-[color:var(--lb-primary-700)] hover:underline"
          onClick={() => handleOpenEdit(r)}
        >
          {r.name}
        </button>
      ),
      sortable: true,
      width: 240,
    },
    {
      id: "clientId",
      header: (
        <div className="inline-flex items-center gap-2">
          <User size={16} /> <span>Client</span>
        </div>
      ),
      accessor: (r) => r.clientId,
      sortable: true,
      width: 200,
    },
    {
      id: "caseType",
      header: (
        <div className="inline-flex items-center gap-2">
          <Tag size={16} /> <span>Type</span>
        </div>
      ),
      accessor: (r) => r.caseType,
      sortable: true,
      width: 140,
    },
    {
      id: "primaryLawyer",
      header: (
        <div className="inline-flex items-center gap-2">
          <Gavel size={16} /> <span>Primary Lawyer</span>
        </div>
      ),
      accessor: (r) => r.primaryLawyer,
      width: 200,
    },
    {
      id: "status",
      header: (
        <div className="inline-flex items-center gap-2">
          <CircleDot size={16} /> <span>Status</span>
        </div>
      ),
      accessor: (r) => cap(r.status),
      sortable: true,
      width: 120,
    },
    {
      id: "billedHours",
      header: (
        <div className="inline-flex items-center gap-2">
          <Clock size={16} /> <span>Billed Hrs</span>
        </div>
      ),
      accessor: (r) => fmtNumber(r.billedHours),
      align: "right",
      width: 120,
      sortable: true,
    },
    {
      id: "billedAmount",
      header: (
        <div className="inline-flex items-center gap-2">
          <CircleDollarSign size={16} /> <span>Billed Amount</span>
        </div>
      ),
      accessor: (r) => money(r.billedAmount),
      align: "right",
      width: 160,
      sortable: true,
    },
  ];

  function getCell(row, id) {
    switch (id) {
      case "name":
        return row.name;
      case "clientId":
        return row.clientId;
      case "status":
        return row.status;
      case "billedAmount":
        return Number(row.billedAmount || 0);
      case "billedHours":
        return Number(row.billedHours || 0);
      default:
        return row[id];
    }
  }

  function onToggleRow(id, checked) {
    setSelectedIds((prev) =>
      checked ? [...prev, id] : prev.filter((x) => x !== id)
    );
  }
  function onToggleAll(checked, ids) {
    setSelectedIds(checked ? ids : []);
  }

  function handleOpenCreate() {
    setEditing(null);
    setFormOpen(true);
  }
  function handleOpenEdit(row) {
    setEditing({
      _id: row._raw?._id,
      name: row.name,
      description: row.description || "",
      client_id: row._raw?.clientId?._id || row._raw?.clientId || "",
      status: (row.status || "open").toLowerCase(),
      primary_lawyer_user_id: row._raw?.primary_lawyer_user_id || "",
      assigned_user_ids: (row._raw?.assigned_user_ids || [])
        .map((u) => (typeof u === "object" ? u._id : u))
        .filter(Boolean)
        .join(", "),
      case_type: row._raw?.case_type || "",
      case_type_id: row._raw?.case_type_id || "",
    });
    setFormOpen(true);
  }

  async function handleSaveCase(payload) {
    if (editing?._id) {
      await dispatch(editCase({ id: editing._id, caseData: payload }));
      toast?.addToast?.({
        tone: "success",
        title: "Case updated",
        description: "Your changes have been saved.",
      });
    } else {
      await dispatch(createCase(payload));
      toast?.addToast?.({
        tone: "success",
        title: "Case created",
        description: "A new matter has been added.",
      });
    }
    dispatch(fetchCases({ q: debouncedQ }));
  }

  const [confirmDelete, setConfirmDelete] = useState(null);
  async function onDelete(id) {
    await dispatch(removeCase(id));
    toast?.addToast?.({
      tone: "success",
      title: "Case deleted",
      description: "The matter has been removed.",
    });
    setConfirmDelete(null);
    dispatch(fetchCases({ q: debouncedQ }));
  }

  return (
    <div className="lb-reset min-h-screen px-4 py-6 bg-[color:var(--lb-app-bg,#f3f4f6)]">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Soft header card */}
        <div className="rounded-[2rem] border border-[color:var(--lb-border)] bg-[color:var(--lb-surface,#ffffff)] shadow-[0_18px_45px_rgba(15,23,42,0.08)] px-5 py-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[0.7rem] uppercase tracking-[0.16em] text-[color:var(--lb-muted,#6b7280)] mb-1">
              Matters
            </p>
            <h1 className="text-2xl md:text-3xl font-semibold flex items-center gap-2">
              <Briefcase size={22} />
              <span>Case Dashboard</span>
            </h1>
            <p className="text-sm text-[color:var(--lb-muted,#6b7280)] mt-1">
              See every active matter at a glance, who owns it, and how much has
              been billed so far.
            </p>
          </div>
          <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
            <div className="text-xs rounded-full border border-[color:var(--lb-border)] bg-white px-3 py-1.5 text-[color:var(--lb-muted)] text-center shadow-[0_10px_30px_rgba(15,23,42,0.08)]">
              {usersLoading ? "Loading team…" : `Team size: ${users.length}`}
            </div>
            <div className="flex items-center gap-2 justify-end">
              <Button
                variant="secondary"
                onClick={() => dispatch(fetchCases({ q: debouncedQ }))}
                className="inline-flex items-center gap-2 rounded-full"
              >
                <RefreshCcw size={16} />
                Refresh
              </Button>
              {perms.canEdit && (
                <Button
                  onClick={handleOpenCreate}
                  className="inline-flex items-center gap-2 rounded-full shadow-[0_12px_30px_rgba(37,99,235,0.55)]"
                >
                  <Plus size={16} />
                  New Case
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Filters + table card */}
        <div className="rounded-[2rem] border border-[color:var(--lb-border)] bg-[color:var(--lb-surface,#ffffff)] shadow-[0_18px_45px_rgba(15,23,42,0.06)] px-5 py-5 space-y-4">
          <TableToolbar className="!border-none !px-0 !pt-0 !pb-3">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between w-full">
              <div className="flex flex-1 items-center gap-3">
                <div className="relative flex-1 min-w-[220px]">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 opacity-60"
                  />
                  <Input
                    className="pl-9 rounded-full"
                    placeholder="Search case, client, or description…"
                    value={filters.q}
                    onChange={(e) => {
                      setPage(1);
                      setFilters({ ...filters, q: e.target.value });
                    }}
                  />
                </div>
                <Select
                  value={filters.status}
                  onChange={(e) => {
                    setPage(1);
                    setFilters({ ...filters, status: e.target.value });
                  }}
                  className="rounded-full min-w-[150px]"
                >
                  <option value="">All statuses</option>
                  <option value="open">Open</option>
                  <option value="on_hold">On hold</option>
                  <option value="closed">Closed</option>
                </Select>
              </div>
              <div className="text-xs text-[color:var(--lb-muted)] md:text-right">
                {filteredRows.length} case
                {filteredRows.length === 1 ? "" : "s"} shown
              </div>
            </div>
          </TableToolbar>

          <div className="rounded-[1.75rem] border border-[color:var(--lb-border)] bg-[color:var(--lb-surface,#ffffff)] overflow-hidden shadow-[0_12px_32px_rgba(15,23,42,0.04)]">
            <DataTable
              columns={columns}
              data={pageRows}
              total={total}
              page={page}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={(s) => {
                setPageSize(s);
                setPage(1);
              }}
              sort={sort}
              onSortChange={setSort}
              selectedIds={selectedIds}
              onToggleRow={onToggleRow}
              onToggleAll={onToggleAll}
              rowKey={(r) => r.id}
              loading={!!loading}
              stickyHeader
              skeleton={<SkeletonRows columns={columns} />}
              rowActions={(r) => (
                <div className="flex items-center gap-2">
                  {perms.canEdit && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenEdit(r)}
                      className="inline-flex items-center gap-1 rounded-full"
                    >
                      <Pencil size={14} />
                      Edit
                    </Button>
                  )}
                  {perms.canDelete && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => setConfirmDelete(r.id)}
                      className="inline-flex items-center gap-1 rounded-full"
                    >
                      <Trash2 size={14} />
                      Delete
                    </Button>
                  )}
                </div>
              )}
            />
          </div>

          {error && (
            <div className="mt-3 rounded-2xl border border-red-200 bg-red-50/80 px-4 py-3 text-sm text-red-700 shadow-[0_12px_32px_rgba(248,113,113,0.35)]">
              {String(error)}
            </div>
          )}
        </div>
      </div>

      <CaseFormModal
        open={formOpen}
        initial={editing}
        onClose={() => setFormOpen(false)}
        onSave={handleSaveCase}
        users={users}
        usersLoading={usersLoading}
      />

      <ConfirmDialog
        open={!!confirmDelete}
        onCancel={() => setConfirmDelete(null)}
        onConfirm={() => onDelete(confirmDelete)}
        title="Delete this case?"
        description="This action cannot be undone."
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}

/* --------------------------------- utils --------------------------------- */
function cap(s) {
  return String(s || "").replace(/^./, (c) => c.toUpperCase());
}
function compare(a, b, desc) {
  if (a == null && b == null) return 0;
  if (a == null) return desc ? 1 : -1;
  if (b == null) return desc ? -1 : 1;
  if (typeof a === "number" && typeof b === "number")
    return desc ? b - a : a - b;
  const an = Number(a),
    bn = Number(b);
  if (!Number.isNaN(an) && !Number.isNaN(bn))
    return desc ? bn - an : an - bn;
  return desc
    ? String(b).localeCompare(String(a), undefined, {
        numeric: true,
        sensitivity: "base",
      })
    : String(a).localeCompare(String(b), undefined, {
        numeric: true,
        sensitivity: "base",
      });
}
function fmtNumber(v) {
  return new Intl.NumberFormat().format(Number(v || 0));
}
function money(v, c = "INR") {
  const n = Number(v || 0);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: c,
  }).format(n);
}

/* ---- Role-aware wrapper (named export) ---- */
export function CaseDashboardBase(
  { role = "intern", readOnly = false, filters = {}, mode, currentUserId } = {},
  props
) {
  return (
    <CaseDashboard
      role={role}
      readOnly={readOnly}
      filters={filters}
      mode={mode}
      currentUserId={currentUserId}
      {...props}
    />
  );
}
