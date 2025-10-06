// src/pages/InvoicesPage.jsx — API‑integrated
import React, { useEffect, useMemo, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchInvoices, addInvoice } from "@/store/invoiceSlice";
import { addInvoicePayment, getPendingSummaryByClient } from "@/services/api";

import { Modal, Button, Badge } from "@/components/common";
import { FormField, Input, NumberInput, Select, DatePicker } from "@/components/form";
import { DataTable, TableToolbar } from "@/components/table";

export default function InvoicesPage() {
  const dispatch = useDispatch();
  const { list = [], loading, error } = useSelector((s) => s.invoices || {});
  const [selectedId, setSelectedId] = useState("");
  const printRef = useRef(null);
  const selected = useMemo(() => (Array.isArray(list) ? list.find(x => x._id === selectedId || x.invoiceNumber === selectedId) : null), [list, selectedId]);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sort, setSort] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [filters, setFilters] = useState({ query: "", status: "" });

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("create");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ invoiceNumber: "", clientName: "", amount: "", status: "draft", issueDate: "", dueDate: "" });

  // Payment modal
  const [payOpen, setPayOpen] = useState(false);
  const [payInvoice, setPayInvoice] = useState(null);
  const [payment, setPayment] = useState({ amount: "", date: "", method: "bank" });

  // Pending by client summary
  const [pendingSummary, setPendingSummary] = useState([]);
  useEffect(() => { dispatch(fetchInvoices()); }, [dispatch]);
  useEffect(() => {
    (async () => {
      try {
        const res = await getPendingSummaryByClient();
        const arr = Array.isArray(res?.data?.items) ? res.data.items : Array.isArray(res?.data) ? res.data : [];
        setPendingSummary(arr.map((x, i) => ({ id: String(x.id ?? i), client: x.clientName || x.client || x._id || "—", pending: Number(x.pending || x.totalPending || 0), invoiceCount: Number(x.invoiceCount || x.count || 0) })));
      } catch (e) { console.error("pending summary load failed", e); }
    })();
  }, []);

  const openCreate = () => { setMode("create"); setEditing(null); setForm({ invoiceNumber: "", clientName: "", amount: "", status: "draft", issueDate: "", dueDate: "" }); setOpen(true); };
  const openView = (row) => { setMode("view"); setEditing(row); setForm({ invoiceNumber: row?.invoiceNumber ?? row?.number ?? "", clientName: row?.clientName ?? row?.client?.name ?? "", amount: row?.amount ?? row?.totalAmount ?? "", status: row?.status ?? "draft", issueDate: row?.issueDate ?? "", dueDate: row?.dueDate ?? "", }); setOpen(true); };
  const openEdit = (row) => { openView(row); setMode("edit"); };
  const close = () => setOpen(false);

  const onToggleRow = (id, checked) => setSelectedIds((prev) => checked ? [...prev, id] : prev.filter((x) => x !== id));
  const onToggleAll = (checked, ids) => setSelectedIds(checked ? ids : []);

  const rows = useMemo(() => {
    let r = Array.isArray(list) ? [...list] : [];
    if (filters.query) {
      const q = filters.query.toLowerCase();
      r = r.filter((x) => String(x.invoiceNumber ?? x.number ?? "").toLowerCase().includes(q) || String(x.clientName ?? x?.client?.name ?? "").toLowerCase().includes(q));
    }
    if (filters.status) r = r.filter((x) => (x.status ?? "").toLowerCase() === filters.status);
    if (sort) {
      const { id, desc } = sort; r.sort((a, b) => { const av = getCellValue(a, id); const bv = getCellValue(b, id); if (av == null && bv == null) return 0; if (av == null) return desc ? 1 : -1; if (bv == null) return desc ? -1 : 1; if (typeof av === "number" && typeof bv === "number") return desc ? bv - av : av - bv; return desc ? String(bv).localeCompare(String(av)) : String(av).localeCompare(String(bv)); });
    }
    return r;
  }, [list, filters, sort]);

  const total = rows.length;
  const paged = useMemo(() => rows.slice((page - 1) * pageSize, page * pageSize), [rows, page, pageSize]);

  const onSubmit = async (e) => {
    e.preventDefault();
    const payload = { invoiceNumber: form.invoiceNumber, clientName: form.clientName, amount: Number(form.amount) || 0, status: form.status || "draft", issueDate: form.issueDate || null, dueDate: form.dueDate || null };
    await dispatch(addInvoice(payload)); setOpen(false); dispatch(fetchInvoices());
  };

  async function onAddPayment(e) {
    e.preventDefault();
    if (!payInvoice?._id) return;
    await addInvoicePayment(payInvoice._id, { amount: Number(payment.amount)||0, date: payment.date || new Date().toISOString(), method: payment.method || "bank" });
    setPayOpen(false); setPayment({ amount: "", date: "", method: "bank" }); dispatch(fetchInvoices());
  }

  const columns = [
    { id: "_sel", header: "", selection: true },
    { id: "invoiceNumber", header: "Invoice #", sortable: true, accessor: (r) => (<button className="text-[color:var(--lb-primary-700)] hover:underline" onClick={() => openView(r)}>{r.invoiceNumber ?? r.number ?? "—"}</button>) },
    { id: "client", header: "Client", accessor: (r) => r.clientName ?? r?.client?.name ?? "—", sortable: true, width: 240 },
    { id: "amount", header: "Amount", accessor: (r) => formatCurrency(r.amount ?? r.totalAmount, r.currency || "INR"), sortable: true, align: "right", width: 140 },
    { id: "status", header: "Status", accessor: (r) => <Badge color={statusColor(r.status)}>{r.status ?? "draft"}</Badge>, sortable: true, width: 140 },
    { id: "pay", header: "", accessor: (r) => (<Button size="sm" variant="ghost" onClick={() => { setPayInvoice(r); setPayOpen(true); }}>Add Payment</Button>) },
  ];

  const pendingColumns = [
    { id: "client", header: "Client", accessor: (r) => r.client, sortable: true },
    { id: "invoiceCount", header: "Invoices", accessor: (r) => r.invoiceCount, align: "right", width: 120, sortable: true },
    { id: "pending", header: "Pending Amount", accessor: (r) => formatCurrency(r.pending, "INR"), align: "right", width: 180, sortable: true },
  ];

  return (
    <div className="lb-reset p-6">
      <h1 className="text-2xl font-semibold mb-3">Invoices</h1>

      {/* Quick filters */}
      <TableToolbar>
        <Input placeholder="Search # / client…" value={filters.query} onChange={(e) => { setPage(1); setFilters({ ...filters, query: e.target.value }); }} />
        <Select value={filters.status} onChange={(e) => { setPage(1); setFilters({ ...filters, status: e.target.value }); }}>
          <option value="">All</option>
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
        </Select>
        <div className="grow" />
        <Button onClick={() => setOpen(true)}>New Invoice</Button>
      </TableToolbar>

      {/* Main table */}
      <DataTable
        columns={columns}
        data={paged}
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
        rowKey={(r) => r._id}
        loading={!!loading}
        stickyHeader
      />

      {/* Pending by client summary */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-2">Pending by Client</h2>
        <DataTable columns={pendingColumns} data={pendingSummary} rowKey={(r) => r.id} />
      </div>

      {/* Create / View / Edit Modal */}
      <Modal open={open} onClose={close} title={mode === "create" ? "New Invoice" : mode === "edit" ? "Edit Invoice" : "Invoice Details"}>
        {mode === "view" ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <KV label="Invoice ID"  value={editing?._id ?? "—"} />
              <KV label="Client ID"   value={editing?.clientId ?? "—"} />
              <KV label="Case ID"     value={editing?.caseId ?? "—"} />
              <KV label="Total"       value={formatCurrency(editing?.totalAmount, editing?.currency || "INR")} />
              <KV label="Currency"    value={editing?.currency || "INR"} />
              <KV label="Status"      value={editing?.status || "draft"} />
              <KV label="Issue Date"  value={fmtDate(editing?.issueDate)} />
              <KV label="Due Date"    value={fmtDate(editing?.dueDate)} />
              <KV label="Notes"       value={editing?.notes || "—"} />
              <KV label="Created By"  value={editing?.createdBy ?? "—"} />
              <KV label="Created At"  value={fmtDate(editing?.createdAt)} />
              <KV label="Updated At"  value={fmtDate(editing?.updatedAt)} />
            </div>
            <div>
              <div className="font-semibold mb-2">Items ({Array.isArray(editing?.items) ? editing.items.length : 0})</div>
              <div className="border rounded-xl overflow-hidden">
                <div className="grid grid-cols-5 px-3 py-2 text-sm bg-gray-50">
                  <div className="font-medium">Description</div>
                  <div className="font-medium text-right">Minutes</div>
                  <div className="font-medium text-right">Rate</div>
                  <div className="font-medium text-right">Amount</div>
                  <div className="font-medium">Billable ID</div>
                </div>
                {Array.isArray(editing?.items) && editing.items.map((it, i) => (
                  <div key={i} className="grid grid-cols-5 px-3 py-2 border-t text-sm">
                    <div className="truncate">{it?.description || "—"}</div>
                    <div className="text-right">{it?.durationMinutes ?? "—"}</div>
                    <div className="text-right">{formatCurrency(it?.rate, editing?.currency || "INR")}</div>
                    <div className="text-right">{formatCurrency(it?.amount, editing?.currency || "INR")}</div>
                    <div className="truncate">{it?.billableId ?? "—"}</div>
                  </div>
                ))}
                {!editing?.items?.length && (<div className="px-3 py-4 text-sm text-gray-500">No items.</div>)}
              </div>
            </div>
            <div className="pt-2"><Button onClick={() => setMode("edit")}>Edit</Button></div>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <FormField label="Invoice #" required>{({ inputId }) => (<Input id={inputId} value={form.invoiceNumber} onChange={(e) => setForm({ ...form, invoiceNumber: e.target.value })} required />)}</FormField>
            <FormField label="Client" required>{({ inputId }) => (<Input id={inputId} value={form.clientName} onChange={(e) => setForm({ ...form, clientName: e.target.value })} required />)}</FormField>
            <FormField label="Amount" required>{({ inputId }) => (<NumberInput id={inputId} value={form.amount} onChange={(v) => setForm({ ...form, amount: v })} min={0} step={0.01} required />)}</FormField>
            <FormField label="Status">{({ inputId }) => (<Select id={inputId} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option value="draft">Draft</option><option value="sent">Sent</option><option value="paid">Paid</option><option value="overdue">Overdue</option></Select>)}</FormField>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Issue Date">{({ inputId }) => (<DatePicker id={inputId} value={form.issueDate} onChange={(v) => setForm({ ...form, issueDate: v })} />)}</FormField>
              <FormField label="Due Date">{({ inputId }) => (<DatePicker id={inputId} value={form.dueDate} onChange={(v) => setForm({ ...form, dueDate: v })} />)}</FormField>
            </div>
            <div className="flex justify-end gap-2 pt-2"><Button variant="secondary" type="button" onClick={close}>Cancel</Button><Button type="submit">Save</Button></div>
          </form>
        )}
      </Modal>

      {/* Add Payment Modal */}
      <Modal open={payOpen} onClose={() => setPayOpen(false)} title="Add Payment">
        <form onSubmit={onAddPayment} className="space-y-4">
          <div className="text-sm text-gray-600">Invoice: <strong>{payInvoice?.invoiceNumber ?? payInvoice?._id ?? "—"}</strong></div>
          <FormField label="Amount" required>{({ inputId }) => (<NumberInput id={inputId} value={payment.amount} onChange={(v) => setPayment((p) => ({ ...p, amount: v }))} min={0} step={0.01} required />)}</FormField>
          <FormField label="Date">{({ inputId }) => (<DatePicker id={inputId} value={payment.date} onChange={(v) => setPayment((p) => ({ ...p, date: v }))} />)}</FormField>
          <FormField label="Method">{({ inputId }) => (<Select id={inputId} value={payment.method} onChange={(e) => setPayment((p) => ({ ...p, method: e.target.value }))}><option value="bank">Bank</option><option value="cash">Cash</option><option value="upi">UPI</option></Select>)}</FormField>
          <div className="flex justify-end gap-2 pt-2"><Button variant="secondary" type="button" onClick={() => setPayOpen(false)}>Cancel</Button><Button type="submit">Add</Button></div>
        </form>
      </Modal>

      {error && <div className="lb-error mt-3">{String(error)}</div>}
    </div>
  );
}

function statusColor(status) { const s = String(status || "draft").toLowerCase(); if (s === "paid") return "success"; if (s === "overdue") return "danger"; if (s === "sent") return "primary"; return "muted"; }
function getCellValue(row, id) { switch (id) { case "invoiceNumber": return row.invoiceNumber ?? row.number ?? ""; case "client": return row.clientName ?? row?.client?.name ?? ""; case "amount": return Number(row.amount ?? row.totalAmount ?? 0); case "status": return row.status ?? ""; default: return row[id]; } }
function formatCurrency(v, currency="INR") { const n = Number(v); if (!isFinite(n)) return "—"; return new Intl.NumberFormat("en-IN", { style: "currency", currency }).format(n); }
function fmtDate(v) { if (!v) return "—"; try { return new Date(v).toLocaleDateString(); } catch { return String(v); } }
function KV({ label, value }) { return (<div className="flex items-start justify-between gap-6"><span className="text-[color:var(--lb-muted)]">{label}</span><span className="font-medium">{value}</span></div>); }

// every Base component signature
export default function XxxxBase({
  role,          // "admin" | "partner" | "lawyer" | "associate" | "intern"
  readOnly,      // boolean
  filters = {},  // e.g., { assignee: userId, author: userId }
  mode,          // e.g., "approvals" for billables
} = {}) { /* keep existing body; later we’ll read props where needed */ }
