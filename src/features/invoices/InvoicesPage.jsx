import React, { useEffect, useMemo, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchInvoices, addInvoice } from "@/store/invoiceSlice";

// Common + Form + Table skeletons via their index barrels
import { Modal, Button, Badge } from "@/components/common";
import { FormField, Input, NumberInput, Select, DatePicker } from "@/components/form";
import { DataTable, TableToolbar } from "@/components/table";

/**
 * InvoicesPage (polished, skeleton-first)
 * - Uses shared Table skeleton (DataTable + TableToolbar)
 * - Uses shared Modal + FormField/Input controls
 * - Wires to Redux slice (fetchInvoices/addInvoice)
 */
export default function InvoicesPage() {
  const dispatch = useDispatch();
  const { list = [], loading, error } = useSelector((s) => s.invoices || {});
  const [selectedId, setSelectedId] = useState("");
  const printRef = useRef(null);
  const selected = useMemo(
    () => (Array.isArray(list) ? list.find(x => x._id === selectedId || x.invoiceNumber === selectedId) : null),
    [list, selectedId]
  );

  // table UI state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sort, setSort] = useState(null); // { id, desc }
  const [selectedIds, setSelectedIds] = useState([]);

  // filters
  const [filters, setFilters] = useState({ query: "", status: "" });

  // modal state
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("create"); // "create" | "view" | "edit"
  const [editing, setEditing] = useState(null);

  // simple local form model (map to backend in onSubmit)
  const [form, setForm] = useState({
    invoiceNumber: "",
    clientName: "",
    amount: "",
    status: "draft",
    issueDate: "",
    dueDate: "",
  });

  useEffect(() => { dispatch(fetchInvoices()); }, [dispatch]);

  const openCreate = () => {
    setMode("create");
    setEditing(null);
    setForm({ invoiceNumber: "", clientName: "", amount: "", status: "draft", issueDate: "", dueDate: "" });
    setOpen(true);
  };

  const openView = (row) => {
    setMode("view");
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

  const openEdit = (row) => { openView(row); setMode("edit"); };
  const close = () => setOpen(false);

  const onToggleRow = (id, checked) => setSelectedIds((prev) => checked ? [...prev, id] : prev.filter((x) => x !== id));
  const onToggleAll = (checked, ids) => setSelectedIds(checked ? ids : []);

  // derived rows with filtering + sorting (client-side; swap to server params later)
  const rows = useMemo(() => {
    let r = Array.isArray(list) ? [...list] : [];
    if (filters.query) {
      const q = filters.query.toLowerCase();
      r = r.filter((x) =>
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
  const paged = useMemo(() => rows.slice((page - 1) * pageSize, page * pageSize), [rows, page, pageSize]);

  const onSubmit = async (e) => {
    e.preventDefault();
    // Map UI form → backend expected payload
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

  const columns = [
    { id: "_sel", header: "", selection: true },
    {
      id: "invoiceNumber",
      header: "Invoice #",
      sortable: true,
      accessor: (r) => (
        <button className="text-[color:var(--lb-primary-700)] hover:underline" onClick={() => openView(r)}>
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
  ];

  return (
    <div className="lb-reset p-6">
      <h1 className="text-2xl font-semibold mb-3">Invoices</h1>

      {/* ---------- ERP-style Invoice Viewer ---------- */}
      <div className="mb-6 rounded-2xl border bg-white p-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-end gap-3 md:gap-4">
          <div className="grow">
            <label className="block text-sm text-gray-500 mb-1">Select invoice</label>
            <Select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
            >
              <option value="">— Choose invoice —</option>
              {list.map((inv) => {
                const label = inv.invoiceNumber ?? inv.number ?? (inv._id?.slice(-8) || "Untitled");
                return <option key={inv._id || label} value={inv._id || inv.invoiceNumber}>{label}</option>;
              })}
            </Select>
          </div>
          <div className="flex gap-2 md:justify-end">
            <Button
              className="no-print"
              variant="secondary"
              disabled={!selected}
              onClick={() => selected && window.print()}
            >
              Print
            </Button>
          </div>
        </div>

        {/* Printable area */}
        {selected ? (
          <div ref={printRef} className="print-area mt-6 bg-white rounded-xl border">
            {/* Header */}
            <div className="p-6 border-b flex items-start justify-between gap-6">
              <div>
                <div className="text-xl font-semibold">BillBot Legal</div>
                <div className="text-sm text-gray-500">Legal Billing ERP</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">INVOICE</div>
                <div className="text-sm text-gray-500">
                  #{selected.invoiceNumber ?? selected.number ?? selected._id}
                </div>
              </div>
            </div>

            {/* Parties + Meta */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <div className="text-sm text-gray-500 mb-1">Bill To</div>
                <div className="text-base font-medium">
                  {selected.clientName
                    ?? selected?.client?.name
                    ?? selected?.clientId?.name
                    ?? selected?.clientId
                    ?? "—"}
                </div>
                <div className="mt-1 text-sm text-gray-600">
                  Case: {selected.caseName
                    ?? selected?.case?.name
                    ?? selected?.caseId?.name
                    ?? selected?.caseId
                    ?? "—"}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-x-4 text-sm">
                <KV label="Issue Date" value={fmtDate(selected.issueDate)} />
                <KV label="Due Date"   value={fmtDate(selected.dueDate)} />
                <KV label="Status"     value={<Badge color={statusColor(selected.status)}>{selected.status ?? "draft"}</Badge>} />
                <KV label="Currency"   value={selected.currency || "INR"} />
                <KV label="Created By" value={selected?.createdBy?.name || selected?.createdBy?.email || selected?.createdBy || "—"} />
                <KV label="Invoice ID" value={selected._id} />
              </div>
            </div>

            {/* Line Items */}
            <div className="px-6 pb-6">
              <div className="border rounded-xl overflow-hidden">
                <div className="grid grid-cols-12 bg-gray-50 px-4 py-2 text-sm font-medium">
                  <div className="col-span-6">Description</div>
                  <div className="col-span-2 text-right">Minutes</div>
                  <div className="col-span-2 text-right">Rate</div>
                  <div className="col-span-2 text-right">Amount</div>
                </div>
                {Array.isArray(selected.items) && selected.items.length > 0 ? (
                  selected.items.map((it, i) => (
                    <div key={i} className="grid grid-cols-12 px-4 py-2 text-sm border-t">
                      <div className="col-span-6">{it?.description || "—"}</div>
                      <div className="col-span-2 text-right">{it?.durationMinutes ?? "—"}</div>
                      <div className="col-span-2 text-right">{formatCurrency(it?.rate, selected?.currency || "INR")}</div>
                      <div className="col-span-2 text-right">{formatCurrency(it?.amount, selected?.currency || "INR")}</div>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-4 text-sm text-gray-500">No items.</div>
                )}
                {/* Totals */}
                <div className="grid grid-cols-12 px-4 py-3 border-t bg-gray-50">
                  <div className="col-span-10 text-right font-medium">Total</div>
                  <div className="col-span-2 text-right font-semibold">
                    {formatCurrency(selected.totalAmount, selected?.currency || "INR")}
                  </div>
                </div>
              </div>
              {selected?.notes && (
                <div className="mt-4 text-sm">
                  <div className="text-gray-500 mb-1">Notes</div>
                  <div className="whitespace-pre-wrap">{selected.notes}</div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="mt-4 text-sm text-gray-500">Choose an invoice to preview and print.</div>
        )}

        {/* Print-only CSS */}
        <style>{`
          @media print {
            body * { visibility: hidden; }
            .print-area, .print-area * { visibility: visible; }
            .print-area { position: absolute; inset: 0; width: 100%; margin: 0; box-shadow: none !important; }
            .no-print { display: none !important; }
          }
        `}</style>
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
      <KV label="__v"         value={editing?.__v ?? 0} />
    </div>

    {/* Line items */}
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
        {!editing?.items?.length && (
          <div className="px-3 py-4 text-sm text-gray-500">No items.</div>
        )}
      </div>
    </div>

    <div className="pt-2">
      <Button onClick={() => setMode("edit")}>Edit</Button>
    </div>
  </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <FormField label="Invoice #" required>
              {({ inputId }) => (
                <Input id={inputId} value={form.invoiceNumber} onChange={(e) => setForm({ ...form, invoiceNumber: e.target.value })} required />
              )}
            </FormField>

            <FormField label="Client" required>
              {({ inputId }) => (
                <Input id={inputId} value={form.clientName} onChange={(e) => setForm({ ...form, clientName: e.target.value })} required />
              )}
            </FormField>

            <FormField label="Amount" required>
              {({ inputId }) => (
                <NumberInput id={inputId} value={form.amount} onChange={(v) => setForm({ ...form, amount: v })} min={0} step={0.01} required />
              )}
            </FormField>

            <FormField label="Status">
              {({ inputId }) => (
                <Select id={inputId} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
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
                  <DatePicker id={inputId} value={form.issueDate} onChange={(v) => setForm({ ...form, issueDate: v })} />
                )}
              </FormField>
              <FormField label="Due Date">
                {({ inputId }) => (
                  <DatePicker id={inputId} value={form.dueDate} onChange={(v) => setForm({ ...form, dueDate: v })} />
                )}
              </FormField>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" type="button" onClick={close}>Cancel</Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
        )}
      </Modal>

      {error && <div className="lb-error mt-3">{String(error)}</div>}
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
    case "invoiceNumber": return row.invoiceNumber ?? row.number ?? "";
    case "client": return row.clientName ?? row?.client?.name ?? "";
    case "amount": return Number(row.amount ?? row.totalAmount ?? 0);
    case "status": return row.status ?? "";
    default: return row[id];
  }
}

function formatCurrency(v, currency="INR") {
  const n = Number(v);
  if (!isFinite(n)) return "—";
  return new Intl.NumberFormat("en-IN", { style: "currency", currency }).format(n);
}

function fmtDate(v) {
  if (!v) return "—";
  try { return new Date(v).toLocaleDateString(); } catch { return String(v); }
}

function KV({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-6">
      <span className="text-[color:var(--lb-muted)]">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
