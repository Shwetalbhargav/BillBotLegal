// src/features/shared/InvoicesPage.jsx

import React, { useEffect, useMemo, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchInvoices, addInvoice } from "@/store/invoiceSlice";
import { addInvoicePayment, getPendingSummaryByClient } from "@/services/api";

import { Modal, Button, Badge } from "@/components/common";
import { FormField, Input, NumberInput, Select, DatePicker } from "@/components/form";
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

export default function InvoicesPage(
  { role = "intern", readOnly = false, filters: externalFilters = {}, mode, currentUserId } = {}
) {
  const perms = derivePermissions(role, readOnly);
  const roleScope = perms.scope;
  const effectiveFilters = { ...externalFilters, scope: roleScope };

  const dispatch = useDispatch();
  const { list = [], loading, error } = useSelector((s) => s.invoices || {});
  const [selectedId, setSelectedId] = useState("");
  const printRef = useRef(null);
  const selected = useMemo(
    () =>
      Array.isArray(list)
        ? list.find((x) => x._id === selectedId || x.invoiceNumber === selectedId)
        : null,
    [list, selectedId]
  );

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sort, setSort] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [filters, setFilters] = useState({ query: "", status: "" });

  const [open, setOpen] = useState(false);
  const [viewMode, setViewMode] = useState("create"); // "create" | "view" | "edit"
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    invoiceNumber: "",
    clientName: "",
    amount: "",
    status: "draft",
    issueDate: "",
    dueDate: "",
  });

  // Payment modal
  const [payOpen, setPayOpen] = useState(false);
  const [payInvoice, setPayInvoice] = useState(null);
  const [payment, setPayment] = useState({ amount: "", date: "", method: "bank" });

  // Pending by client summary
  const [pendingSummary, setPendingSummary] = useState([]);

  useEffect(() => {
    dispatch(fetchInvoices());
  }, [dispatch]);

  useEffect(() => {
    (async () => {
      try {
        const res = await getPendingSummaryByClient();
        const arr = Array.isArray(res?.data?.items)
          ? res.data.items
          : Array.isArray(res?.data)
          ? res.data
          : [];
        setPendingSummary(
          arr.map((x, i) => ({
            id: String(x.id ?? i),
            client: x.clientName || x.client || x._id || "—",
            pending: Number(x.pending || x.totalPending || 0),
            invoiceCount: Number(x.invoiceCount || x.count || 0),
          }))
        );
      } catch (e) {
        console.error("pending summary load failed", e);
      }
    })();
  }, []);

  const openCreate = () => {
    setViewMode("create");
    setEditing(null);
    setForm({
      invoiceNumber: "",
      clientName: "",
      amount: "",
      status: "draft",
      issueDate: "",
      dueDate: "",
    });
    setOpen(true);
  };
  const openView = (row) => {
    setViewMode("view");
    setEditing(row);
    setForm({
      invoiceNumber: row?.invoiceNumber ?? row?.number ?? "",
      clientName: row?.clientName ?? row?.client?.name ?? "",
      amount: row?.amount ?? row?.totalAmount ?? "",
      status: row?.status ?? "draft",
      issueDate: row?.issueDate ?? "",
      dueDate: row?.dueDate ?? "",
    });
    setOpen(true);
  };
  const openEdit = (row) => {
    openView(row);
    setViewMode("edit");
  };
  const close = () => setOpen(false);

  const onToggleRow = (id, checked) =>
    setSelectedIds((prev) => (checked ? [...prev, id] : prev.filter((x) => x !== id)));
  const onToggleAll = (checked, ids) => setSelectedIds(checked ? ids : []);

  const rows = useMemo(() => {
    let r = Array.isArray(list) ? [...list] : [];
    if (filters.query) {
      const q = filters.query.toLowerCase();
      r = r.filter(
        (x) =>
          String(x.invoiceNumber ?? x.number ?? "").toLowerCase().includes(q) ||
          String(x.clientName ?? x?.client?.name ?? "").toLowerCase().includes(q)
      );
    }
    if (filters.status) r = r.filter((x) => (x.status ?? "").toLowerCase() === filters.status);
    if (sort) {
      const { id, desc } = sort;
      r.sort((a, b) => {
        const av = getCellValue(a, id);
        const bv = getCellValue(b, id);
        if (av == null && bv == null) return 0;
        if (av == null) return desc ? 1 : -1;
        if (bv == null) return desc ? -1 : 1;
        if (typeof av === "number" && typeof bv === "number") return desc ? bv - av : av - bv;
        return desc ? String(bv).localeCompare(String(av)) : String(av).localeCompare(String(bv));
      });
    }
    return r;
  }, [list, filters, sort]);

  const total = rows.length;
  const paged = useMemo(
    () => rows.slice((page - 1) * pageSize, page * pageSize),
    [rows, page, pageSize]
  );

  const onSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      invoiceNumber: form.invoiceNumber,
      clientName: form.clientName,
      amount: Number(form.amount) || 0,
      status: form.status || "draft",
      issueDate: form.issueDate || null,
      dueDate: form.dueDate || null,
    };
    await dispatch(addInvoice(payload));
    setOpen(false);
    dispatch(fetchInvoices());
  };

  async function onAddPayment(e) {
    e.preventDefault();
    if (!payInvoice?._id) return;
    await addInvoicePayment(payInvoice._id, {
      amount: Number(payment.amount) || 0,
      date: payment.date || new Date().toISOString(),
      method: payment.method || "bank",
    });
    setPayOpen(false);
    setPayment({ amount: "", date: "", method: "bank" });
    dispatch(fetchInvoices());
  }

  const columns = [
    { id: "_sel", header: "", selection: true },
    {
      id: "invoiceNumber",
      header: "Invoice #",
      sortable: true,
      accessor: (r) => (
        <button
          className="text-indigo-600 hover:text-indigo-700 hover:underline font-medium"
          onClick={() => openView(r)}
        >
          {r.invoiceNumber ?? r.number ?? "—"}
        </button>
      ),
    },
    {
      id: "client",
      header: "Client",
      accessor: (r) => r.clientName ?? r?.client?.name ?? "—",
      sortable: true,
      width: 240,
    },
    {
      id: "amount",
      header: "Amount",
      accessor: (r) => formatCurrency(r.amount ?? r.totalAmount, r.currency || "INR"),
      sortable: true,
      align: "right",
      width: 140,
    },
    {
      id: "status",
      header: "Status",
      accessor: (r) => <Badge color={statusColor(r.status)}>{r.status ?? "draft"}</Badge>,
      sortable: true,
      width: 140,
    },
    {
      id: "pay",
      header: "",
      accessor: (r) =>
        perms.canInvoice &&
        !perms.readOnly && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setPayInvoice(r);
              setPayOpen(true);
            }}
          >
            Add Payment
          </Button>
        ),
    },
  ];

  const pendingColumns = [
    { id: "client", header: "Client", accessor: (r) => r.client, sortable: true },
    {
      id: "invoiceCount",
      header: "Invoices",
      accessor: (r) => r.invoiceCount,
      align: "right",
      width: 120,
      sortable: true,
    },
    {
      id: "pending",
      header: "Pending Amount",
      accessor: (r) => formatCurrency(r.pending, "INR"),
      align: "right",
      width: 180,
      sortable: true,
    },
  ];

  const totalPending = pendingSummary.reduce((sum, item) => sum + (item.pending || 0), 0);

  return (
    <div className="lb-reset min-h-full bg-slate-50/80">
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Invoices</h1>
            <p className="mt-1 text-sm text-slate-500">
              Track invoice status, quickly log payments, and see client-wise pending amounts.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={openCreate}>New Invoice</Button>
          </div>
        </div>

        {/* Two-panel dashboard */}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)]">
          {/* Left: invoices table */}
          <div className="rounded-2xl border border-slate-200/70 bg-white/90 shadow-sm backdrop-blur-sm overflow-hidden">
            <div className="px-4 pt-4 pb-3 border-b border-slate-100">
              <TableToolbar>
                <Input
                  placeholder="Search invoice # / client…"
                  value={filters.query}
                  onChange={(e) => {
                    setPage(1);
                    setFilters({ ...filters, query: e.target.value });
                  }}
                  className="max-w-md"
                />
                <Select
                  value={filters.status}
                  onChange={(e) => {
                    setPage(1);
                    setFilters({ ...filters, status: e.target.value });
                  }}
                >
                  <option value="">All</option>
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                </Select>
                <div className="grow" />
                <div className="hidden sm:flex items-center text-xs text-slate-500">
                  Showing {paged.length} of {total} invoices
                </div>
              </TableToolbar>
            </div>

            <div className="px-2 sm:px-4 pb-4">
              <DataTable
                columns={columns}
                data={paged}
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
                rowKey={(r) => r._id}
                loading={!!loading}
                stickyHeader
              />
            </div>
          </div>

          {/* Right: pending summary card */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200/70 bg-white/90 shadow-sm backdrop-blur-sm p-4">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">
                    Pending by Client
                  </h2>
                  <p className="text-xs text-slate-500">
                    Quick view of outstanding invoices per client.
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase tracking-wide text-slate-500">
                    Total Pending
                  </div>
                  <div className="text-sm font-semibold text-slate-900">
                    {formatCurrency(totalPending, "INR")}
                  </div>
                </div>
              </div>

              <div className="mt-3">
                <DataTable
                  columns={pendingColumns}
                  data={pendingSummary}
                  rowKey={(r) => r.id}
                  pageSize={5}
                  hidePagination
                />
              </div>
            </div>

            {/* Tiny legend card (optional, but helpful UX) */}
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50/80 px-3 py-3 text-xs text-slate-600 space-y-1">
              <div className="font-medium text-slate-700">Status legend</div>
              <div className="flex flex-wrap gap-3">
                <span>🟢 Paid</span>
                <span>🔵 Sent</span>
                <span>🟡 Draft</span>
                <span>🔴 Overdue</span>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-rose-200/70 bg-rose-50 px-3 py-2 text-sm text-rose-900">
            {String(error)}
          </div>
        )}
      </div>

      {/* Create / View / Edit Modal */}
      <Modal
        open={open}
        onClose={close}
        title={
          viewMode === "create"
            ? "New Invoice"
            : viewMode === "edit"
            ? "Edit Invoice"
            : "Invoice Details"
        }
      >
        {viewMode === "view" ? (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 rounded-2xl border border-slate-200/70 bg-slate-50/60 px-3 py-3">
              <KV label="Invoice ID" value={editing?._id ?? "—"} />
              <KV label="Client ID" value={editing?.clientId ?? "—"} />
              <KV label="Case ID" value={editing?.caseId ?? "—"} />
              <KV
                label="Total"
                value={formatCurrency(
                  editing?.totalAmount,
                  editing?.currency || "INR"
                )}
              />
              <KV label="Currency" value={editing?.currency || "INR"} />
              <KV label="Status" value={editing?.status || "draft"} />
              <KV label="Issue Date" value={fmtDate(editing?.issueDate)} />
              <KV label="Due Date" value={fmtDate(editing?.dueDate)} />
              <KV label="Notes" value={editing?.notes || "—"} />
              <KV label="Created By" value={editing?.createdBy ?? "—"} />
              <KV label="Created At" value={fmtDate(editing?.createdAt)} />
              <KV label="Updated At" value={fmtDate(editing?.updatedAt)} />
            </div>
            <div>
              <div className="font-semibold mb-2 text-sm text-slate-900">
                Items (
                {Array.isArray(editing?.items) ? editing.items.length : 0})
              </div>
              <div className="border border-slate-200/70 rounded-2xl overflow-hidden bg-white/90">
                <div className="grid grid-cols-5 px-3 py-2 text-xs font-medium text-slate-500 bg-slate-50">
                  <div>Description</div>
                  <div className="text-right">Minutes</div>
                  <div className="text-right">Rate</div>
                  <div className="text-right">Amount</div>
                  <div>Billable ID</div>
                </div>
                {Array.isArray(editing?.items) &&
                  editing.items.map((it, i) => (
                    <div
                      key={i}
                      className="grid grid-cols-5 px-3 py-2 border-t border-slate-100 text-xs text-slate-800"
                    >
                      <div className="truncate">{it?.description || "—"}</div>
                      <div className="text-right">
                        {it?.durationMinutes ?? "—"}
                      </div>
                      <div className="text-right">
                        {formatCurrency(
                          it?.rate,
                          editing?.currency || "INR"
                        )}
                      </div>
                      <div className="text-right">
                        {formatCurrency(
                          it?.amount,
                          editing?.currency || "INR"
                        )}
                      </div>
                      <div className="truncate">{it?.billableId ?? "—"}</div>
                    </div>
                  ))}
                {!editing?.items?.length && (
                  <div className="px-3 py-4 text-xs text-slate-500">
                    No items.
                  </div>
                )}
              </div>
            </div>
            <div className="pt-2 flex justify-end">
              <Button onClick={() => setViewMode("edit")}>Edit</Button>
            </div>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <FormField label="Invoice #" required>
              {({ inputId }) => (
                <Input
                  id={inputId}
                  value={form.invoiceNumber}
                  onChange={(e) =>
                    setForm({ ...form, invoiceNumber: e.target.value })
                  }
                  required
                />
              )}
            </FormField>
            <FormField label="Client" required>
              {({ inputId }) => (
                <Input
                  id={inputId}
                  value={form.clientName}
                  onChange={(e) =>
                    setForm({ ...form, clientName: e.target.value })
                  }
                  required
                />
              )}
            </FormField>
            <FormField label="Amount" required>
              {({ inputId }) => (
                <NumberInput
                  id={inputId}
                  value={form.amount}
                  onChange={(v) => setForm({ ...form, amount: v })}
                  min={0}
                  step={0.01}
                  required
                />
              )}
            </FormField>
            <FormField label="Status">
              {({ inputId }) => (
                <Select
                  id={inputId}
                  value={form.status}
                  onChange={(e) =>
                    setForm({ ...form, status: e.target.value })
                  }
                >
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                </Select>
              )}
            </FormField>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Issue Date">
                {({ inputId }) => (
                  <DatePicker
                    id={inputId}
                    value={form.issueDate}
                    onChange={(v) => setForm({ ...form, issueDate: v })}
                  />
                )}
              </FormField>
              <FormField label="Due Date">
                {({ inputId }) => (
                  <DatePicker
                    id={inputId}
                    value={form.dueDate}
                    onChange={(v) => setForm({ ...form, dueDate: v })}
                  />
                )}
              </FormField>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 mt-4">
              <Button variant="secondary" type="button" onClick={close}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Add Payment Modal */}
      <Modal open={payOpen} onClose={() => setPayOpen(false)} title="Add Payment">
        <form onSubmit={onAddPayment} className="space-y-4 text-sm">
          <div className="text-slate-600">
            Invoice:{" "}
            <strong>{payInvoice?.invoiceNumber ?? payInvoice?._id ?? "—"}</strong>
          </div>
          <FormField label="Amount" required>
            {({ inputId }) => (
              <NumberInput
                id={inputId}
                value={payment.amount}
                onChange={(v) => setPayment((p) => ({ ...p, amount: v }))}
                min={0}
                step={0.01}
                required
              />
            )}
          </FormField>
          <FormField label="Date">
            {({ inputId }) => (
              <DatePicker
                id={inputId}
                value={payment.date}
                onChange={(v) => setPayment((p) => ({ ...p, date: v }))}
              />
            )}
          </FormField>
          <FormField label="Method">
            {({ inputId }) => (
              <Select
                id={inputId}
                value={payment.method}
                onChange={(e) =>
                  setPayment((p) => ({ ...p, method: e.target.value }))
                }
              >
                <option value="bank">Bank</option>
                <option value="cash">Cash</option>
                <option value="upi">UPI</option>
              </Select>
            )}
          </FormField>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 mt-4">
            <Button variant="secondary" type="button" onClick={() => setPayOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Add</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function statusColor(status) {
  const s = String(status || "draft").toLowerCase();
  if (s === "paid") return "success";
  if (s === "overdue") return "danger";
  if (s === "sent") return "primary";
  return "muted";
}
function getCellValue(row, id) {
  switch (id) {
    case "invoiceNumber":
      return row.invoiceNumber ?? row.number ?? "";
    case "client":
      return row.clientName ?? row?.client?.name ?? "";
    case "amount":
      return Number(row.amount ?? row.totalAmount ?? 0);
    case "status":
      return row.status ?? "";
    default:
      return row[id];
  }
}
function formatCurrency(v, currency = "INR") {
  const n = Number(v);
  if (!isFinite(n)) return "—";
  return new Intl.NumberFormat("en-IN", { style: "currency", currency }).format(
    n
  );
}
function fmtDate(v) {
  if (!v) return "—";
  try {
    return new Date(v).toLocaleDateString();
  } catch {
    return String(v);
  }
}
function KV({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-6">
      <span className="text-xs font-medium text-slate-500">{label}</span>
      <span className="font-medium text-slate-900">{value}</span>
    </div>
  );
}

/* ---- Role-aware wrapper (named export) ---- */
export function InvoicesBase(
  { role = "intern", readOnly = false, filters = {}, mode, currentUserId } = {},
  props
) {
  return (
    <InvoicesPage
      role={role}
      readOnly={readOnly}
      filters={filters}
      mode={mode}
      currentUserId={currentUserId}
      {...props}
    />
  );
}
