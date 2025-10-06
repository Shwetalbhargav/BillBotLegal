import React, { useEffect, useMemo, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchClients } from "@/store/clientSlice";
import { fetchBillables } from "@/store/billableSlice";
import { fetchInvoices } from "@/store/invoiceSlice";
import { fetchCases } from "@/store/caseSlice";
import { Input, Select } from "@/components/form";
import { DataTable, TableToolbar, SkeletonRows } from "@/components/table";
import { Badge, Button, Modal } from "@/components/common";
import AiWriterInline from "@/components/AiWriterInline";

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString() : "—");
const money = (n, c = "INR") =>
  isFinite(Number(n))
    ? new Intl.NumberFormat("en-IN", { style: "currency", currency: c }).format(Number(n))
    : "—";
const toHours = (b) =>
  typeof b?.durationHours === "number" ? b.durationHours : Number(b?.durationMinutes || 0) / 60;

// ---- Gmail helpers (new) ----
const DEFAULT_COMPOSE_TO = "hridaan.purav@gmail.com";
function buildGmailComposeUrl({ to, subject, body , lbPrompt}) {
  const params = new URLSearchParams({
    view: "cm",
    fs: "1",
    to,
    su: subject || "",
    body: body || "",
    lb_prompt: lbPrompt || ""
  });
  return `https://mail.google.com/mail/u/0/?${params.toString()}`;
}

export default function ClientsPage() {
  const dispatch = useDispatch();

  // slices
  const { list: clients = [], loading: loadingClients, error: errorClients } = useSelector((s) => s.clients || {});
  const { list: billables = [], loading: loadingBillables } = useSelector((s) => s.billables || {});
  const { list: invoices = [], loading: loadingInvoices } = useSelector((s) => s.invoices || {});
  const { list: cases = [], loading: loadingCases } = useSelector((s) => s.cases || {});

  const [q, setQ] = useState("");
  const [managerFilter, setManagerFilter] = useState("");
  const [selectedClient, setSelectedClient] = useState(null);

  // modal sub‑state
  const [dataType, setDataType] = useState("billables"); // 'billables' | 'invoices' | 'cases'
  const [preview, setPreview] = useState(null); // selected billable/invoice row
  const printRef = useRef(null);

  useEffect(() => {
    dispatch(fetchClients());
  }, [dispatch]); // clients

  // lazy fetch others only when modal opens / data type changes
  useEffect(() => {
    if (!selectedClient) return;
    if (dataType === "billables") dispatch(fetchBillables());
    if (dataType === "invoices") dispatch(fetchInvoices());
    if (dataType === "cases") dispatch(fetchCases());
  }, [selectedClient, dataType, dispatch]);

  // manager filter options (populated name)
  const managerOptions = useMemo(() => {
    const names = new Map();
    for (const c of clients) {
      const m = typeof c.accountManagerId === "object" ? c.accountManagerId?.name : null;
      if (m) names.set(m, m);
    }
    return Array.from(names.values()).map((n) => ({ label: n, value: n }));
  }, [clients]);

  // top table (clients)
  const rows = useMemo(() => {
    let r = Array.isArray(clients) ? [...clients] : [];
    if (managerFilter) {
      r = r.filter((c) => (typeof c.accountManagerId === "object" ? c.accountManagerId?.name : "") === managerFilter);
    }
    if (q.trim()) {
      const t = q.toLowerCase();
      r = r.filter(
        (c) =>
          String(c.name || "").toLowerCase().includes(t) ||
          String(c.email || c.contactInfo || "").toLowerCase().includes(t) ||
          String(c.phone || "").toLowerCase().includes(t)
      );
    }
    r.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return r;
  }, [clients, managerFilter, q]);

  // ---- TABLE COLUMNS (now with Compose button in table) ----
  const clientColumns = [
    { id: "name", header: "Client", accessor: (c) => c.name, sortable: true, width: 260 },
    { id: "email", header: "Email", accessor: (c) => c.email || c.contactInfo || "—", width: 240 },
    { id: "phone", header: "Phone", accessor: (c) => c.phone || "—", width: 140 },
    {
      id: "manager",
      header: "Account Manager",
      accessor: (c) => (typeof c.accountManagerId === "object" ? c.accountManagerId?.name : "—"),
      sortable: true,
      width: 220,
    },
    { id: "created", header: "Created", accessor: (c) => fmtDate(c.createdAt), sortable: true, width: 120 },
    {
      id: "compose",
      header: "",
      accessor: (c) => {
        const to = c.email || c.contactInfo || DEFAULT_COMPOSE_TO;
        const subj = `[LB] Update for ${c.name || "Client"}`;
        const body = `Hello${c.name ? ` ${c.name}` : ""},\n\n`;
        return (
          <Button
  variant="secondary"
  size="sm"
  onClick={() => {
    const subj = `[LB] Update for ${selectedClient?.name || "Client"}`;
    const body = `Hello ${selectedClient?.name || "there"},\n\n`;
    const lbPrompt =
      `Recipient: ${selectedClient?.name || "Client"} (${selectedClient?.email || ""}). ` +
      `Draft a concise, professional legal update email related to the current matter. ` +
      `Tone: formal, clear, no jargon. Include a short subject suggestion and a brief closing.`;

    window.open(
      buildGmailComposeUrl({ to: selectedClient?.email || "", subject: subj, body, lbPrompt }),
      "_blank",
      "noopener,noreferrer"
    );
  }}
>
  Compose Email
</Button>
        );
      },
      width: 120,
    },
    {
      id: "action",
      header: "",
      accessor: (c) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setSelectedClient(c);
            setDataType("billables");
            setPreview(null);
          }}
        >
          View
        </Button>
      ),
      width: 80,
    },
  ];
  <AiWriterInline
  to={selectedClient?.email || selectedClient?.contactInfo}
  subjectSeed={`[LB] Update for ${selectedClient?.name || 'Client'}`}
/>

  // ---- Modal: filtered data by client ----
  const cid = selectedClient?._id;

  const billablesForClient = useMemo(() => {
    const arr = Array.isArray(billables) ? billables : [];
    return arr.filter((b) => (typeof b.clientId === "object" ? b.clientId?._id : b.clientId) === cid);
  }, [billables, cid]);

  const invoicesForClient = useMemo(() => {
    const arr = Array.isArray(invoices) ? invoices : [];
    return arr.filter((inv) => (typeof inv.clientId === "object" ? inv.clientId?._id : inv.clientId) === cid);
  }, [invoices, cid]);

  const casesForClient = useMemo(() => {
    const arr = Array.isArray(cases) ? cases : [];
    return arr.filter((cs) => (typeof cs.clientId === "object" ? cs.clientId?._id : cs.clientId) === cid);
  }, [cases, cid]);

  const billableCols = [
    { id: "date", header: "Date", accessor: (r) => fmtDate(r.date), sortable: true },
    { id: "case", header: "Case", accessor: (r) => (typeof r.caseId === "object" ? r.caseId?.name : r.caseId) },
    { id: "category", header: "Category", accessor: (r) => r.category },
    { id: "description", header: "Description", accessor: (r) => r.description, width: 320 },
    { id: "hours", header: "Hours", accessor: (r) => toHours(r).toFixed(2), align: "right" },
    { id: "rate", header: "Rate", accessor: (r) => money(r.rate), align: "right" },
    { id: "amount", header: "Amount", accessor: (r) => money(r.amount), align: "right" },
    {
      id: "act",
      header: "",
      accessor: (r) => (
        <Button variant="ghost" size="sm" onClick={() => setPreview({ type: "billable", data: r })}>
          Preview
        </Button>
      ),
    },
  ];

  const invoiceCols = [
    { id: "invoiceNumber", header: "Invoice #", accessor: (r) => r.invoiceNumber ?? r.number ?? "—", sortable: true },
    { id: "issue", header: "Issue Date", accessor: (r) => fmtDate(r.issueDate) },
    { id: "due", header: "Due Date", accessor: (r) => fmtDate(r.dueDate) },
    { id: "status", header: "Status", accessor: (r) => <Badge>{r.status || "draft"}</Badge> },
    { id: "total", header: "Total", accessor: (r) => money(r.totalAmount ?? r.amount), align: "right" },
    {
      id: "act",
      header: "",
      accessor: (r) => (
        <Button variant="ghost" size="sm" onClick={() => setPreview({ type: "invoice", data: r })}>
          Preview
        </Button>
      ),
    },
  ];

  const caseCols = [
    { id: "name", header: "Case", accessor: (r) => r.name ?? r.caseName ?? "—", sortable: true, width: 280 },
    { id: "status", header: "Status", accessor: (r) => <Badge tone="secondary">{r.status || "—"}</Badge> },
    { id: "created", header: "Created", accessor: (r) => fmtDate(r.createdAt) },
  ];

  const modalTable =
    {
      billables: {
        title: "Billables",
        cols: billableCols,
        rows: billablesForClient,
        loading: loadingBillables,
      },
      invoices: {
        title: "Invoices",
        cols: invoiceCols,
        rows: invoicesForClient,
        loading: loadingInvoices,
      },
      cases: {
        title: "Cases",
        cols: caseCols,
        rows: casesForClient,
        loading: loadingCases,
      },
    }[dataType];

  const onPrint = () => {
    if (!preview) return;
    const css = `
      @media print {
        body * { visibility: hidden; }
        .printable, .printable * { visibility: visible; }
        .printable { position: absolute; inset: 0; width: 100%; box-shadow: none !important; }
      }`;
    const tag = document.createElement("style");
    tag.innerHTML = css;
    document.head.appendChild(tag);
    window.print();
    setTimeout(() => tag.remove(), 0);
  };

  return (
    <div className="lb-reset p-6">
      <h1 className="text-2xl font-semibold mb-4">Clients</h1>

      <TableToolbar rightActions={[]}>
        <div className="flex items-center gap-3">
          <Input placeholder="Search name, email, phone…" value={q} onChange={(e) => setQ(e.target.value)} />
          <Select value={managerFilter} onChange={(e) => setManagerFilter(e.target.value)}>
            <option value="">All account managers</option>
            {managerOptions.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </Select>
        </div>
      </TableToolbar>

      <DataTable
        columns={clientColumns}
        data={rows}
        loading={loadingClients}
        rowKey={(r) => r._id}
        skeleton={<SkeletonRows columns={clientColumns} />}
      />

      {/* CLIENT MODAL */}
      <Modal
        open={!!selectedClient}
        onClose={() => {
          setSelectedClient(null);
          setPreview(null);
        }}
        title={selectedClient ? selectedClient.name : "Client"}
      >
        {selectedClient && (
          <div className="space-y-4">
            {/* Client header */}
            <div className="flex flex-col gap-4 max-h-[78vh] overflow-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <KV label="Email" value={selectedClient.email || selectedClient.contactInfo || "—"} />
                <KV label="Phone" value={selectedClient.phone || "—"} />
                <KV
                  label="Account Manager"
                  value={
                    typeof selectedClient.accountManagerId === "object"
                      ? selectedClient.accountManagerId?.name
                      : "—"
                  }
                />
                <KV label="Created" value={fmtDate(selectedClient.createdAt)} />
              </div>

              {/* Data type toolbar */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Data type:</span>
                <Select
                  value={dataType}
                  onChange={(e) => {
                    setDataType(e.target.value);
                    setPreview(null);
                  }}
                >
                  <option value="billables">Billables</option>
                  <option value="invoices">Invoices</option>
                  <option value="cases">Cases</option>
                </Select>
              </div>

              {/* Type table */}
              <DataTable
                columns={modalTable.cols}
                data={modalTable.rows}
                loading={modalTable.loading}
                rowKey={(r) => r._id || r.invoiceNumber || `${r.name}-${r.createdAt}`}
                skeleton={<SkeletonRows columns={modalTable.cols} />}
              />

              {/* Row preview (billable/invoice) */}
              {preview && (
                <div className="rounded-2xl bg-white ring-1 ring-black/5 shadow p-4">
                  {preview.type === "billable" ? (
                    <div ref={printRef} className="printable">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-lg font-semibold">Billable</div>
                          <div className="text-sm text-gray-500">{fmtDate(preview.data.date)}</div>
                        </div>
                        <Button onClick={onPrint}>Print</Button>
                      </div>
                      <div className="mt-3 grid grid-cols-1 gap-2 text-sm">
                        <KV
                          label="Client"
                          value={
                            typeof preview.data.clientId === "object"
                              ? preview.data.clientId?.name
                              : selectedClient.name
                          }
                        />
                        <KV
                          label="Case"
                          value={
                            typeof preview.data.caseId === "object"
                              ? preview.data.caseId?.name
                              : preview.data.caseId
                          }
                        />
                        <KV label="Category" value={preview.data.category} />
                        <KV label="Description" value={preview.data.description} />
                      </div>
                      <div className="mt-4 grid grid-cols-3 gap-3">
                        <Metric label="Hours" value={toHours(preview.data).toFixed(2)} />
                        <Metric label="Rate" value={money(preview.data.rate)} />
                        <Metric label="Amount" value={money(preview.data.amount)} />
                      </div>
                    </div>
                  ) : preview.type === "invoice" ? (
                    <div ref={printRef} className="printable">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-lg font-semibold">
                            Invoice #{preview.data.invoiceNumber ?? preview.data.number ?? "—"}
                          </div>
                          <div className="text-sm text-gray-500">
                            Issue: {fmtDate(preview.data.issueDate)} · Due: {fmtDate(preview.data.dueDate)}
                          </div>
                        </div>
                        <Button onClick={onPrint}>Print</Button>
                      </div>
                      <div className="mt-3 grid grid-cols-1 gap-2 text-sm">
                        <KV
                          label="Client"
                          value={
                            typeof preview.data.clientId === "object"
                              ? preview.data.clientId?.name
                              : selectedClient.name
                          }
                        />
                        <KV label="Status" value={preview.data.status || "draft"} />
                        <KV label="Total" value={money(preview.data.totalAmount ?? preview.data.amount)} />
                      </div>
                      {Array.isArray(preview.data.items) && preview.data.items.length > 0 && (
                        <div className="mt-3 text-sm">
                          <div className="font-medium mb-1">Items</div>
                          <div className="border rounded-xl overflow-hidden">
                            <div className="grid grid-cols-12 bg-gray-50 px-3 py-1.5">
                              <div className="col-span-6">Description</div>
                              <div className="col-span-2 text-right">Minutes</div>
                              <div className="col-span-2 text-right">Rate</div>
                              <div className="col-span-2 text-right">Amount</div>
                            </div>
                            {preview.data.items.map((it, i) => (
                              <div key={i} className="grid grid-cols-12 px-3 py-1.5 border-t">
                                <div className="col-span-6">{it.description || "—"}</div>
                                <div className="col-span-2 text-right">{it.durationMinutes ?? "—"}</div>
                                <div className="col-span-2 text-right">{money(it.rate)}</div>
                                <div className="col-span-2 text-right">{money(it.amount)}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {errorClients && <div className="mt-4 text-red-600">{String(errorClients)}</div>}
    </div>
  );
}

function KV({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-6">
      <span className="text-[color:var(--lb-muted)]">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
}
function Metric({ label, value }) {
  return (
    <div className="rounded-xl bg-gray-50 p-3 text-center">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
}

// every Base component signature
export default function XxxxBase({
  role,          // "admin" | "partner" | "lawyer" | "associate" | "intern"
  readOnly,      // boolean
  filters = {},  // e.g., { assignee: userId, author: userId }
  mode,          // e.g., "approvals" for billables
} = {}) { /* keep existing body; later we’ll read props where needed */ }
