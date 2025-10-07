// src/features/billables/BillablesPage.jsx — fixed
import React, { useEffect, useMemo, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchBillables } from "@/store/billableSlice";
import { getUnbilledBillables } from "@/services/api";

import { Input, Select } from "@/components/form";
import { Button, Badge, Modal } from "@/components/common";
import { DataTable, TableToolbar, SkeletonRows } from "@/components/table";

const money = (n, c = "INR") =>
  isFinite(Number(n))
    ? new Intl.NumberFormat("en-IN", { style: "currency", currency: c }).format(Number(n))
    : "—";
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString() : "—");
const hoursOf = (b) =>
  typeof b.durationHours === "number"
    ? b.durationHours
    : Number(b.durationMinutes || 0) / 60;

/* ---------------- Role & Permission helpers (RBAC) ---------------- */
function derivePermissions(role, explicitReadOnly=false) {
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

export default function BillablesPage({ role="intern", readOnly=false, filters: externalFilters = {} , mode, currentUserId } = {}) {
  const perms = derivePermissions(role, readOnly);

  const dispatch = useDispatch();
  const { list = [], loading, error } = useSelector((s) => s.billables || {});
  const [clientFilter, setClientFilter] = useState("");
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState(null);
  const [showUnbilledOnly, setShowUnbilledOnly] = useState(false);
  const [unbilled, setUnbilled] = useState([]);
  const printRef = useRef(null);

  useEffect(() => { dispatch(fetchBillables()); }, [dispatch]);

  useEffect(() => {
    if (!showUnbilledOnly) return;
    (async () => {
      try {
        const res = await getUnbilledBillables();
        const arr = Array.isArray(res?.data?.items) ? res.data.items : Array.isArray(res?.data) ? res.data : [];
        setUnbilled(arr);
      } catch (e) {
        console.error("failed to load unbilled", e);
      }
    })();
  }, [showUnbilledOnly]);

  const source = showUnbilledOnly ? unbilled : list;

  // build client dropdown
  const clientOptions = useMemo(() => {
    const map = new Map();
    for (const b of source) {
      const cid = typeof b.clientId === "object" ? b.clientId?._id : b.clientId;
      const cname = typeof b.clientId === "object" ? b.clientId?.name || cid : b.clientId || cid;
      if (cid && !map.has(cid)) map.set(cid, cname);
    }
    return Array.from(map, ([value, label]) => ({ value, label }));
  }, [source]);

  // filtered rows
  const rows = useMemo(() => {
    let r = Array.isArray(source) ? [...source] : [];
    if (clientFilter) {
      r = r.filter((b) => {
        const cid = typeof b.clientId === "object" ? b.clientId?._id : b.clientId;
        return cid === clientFilter;
      });
    }
    if (q.trim()) {
      const t = q.toLowerCase();
      r = r.filter(
        (b) =>
          String(b.description || "").toLowerCase().includes(t) ||
          String(b.category || "").toLowerCase().includes(t) ||
          String((typeof b.caseId === "object" ? b.caseId?.name : b.caseId) || "")
            .toLowerCase()
            .includes(t)
      );
    }
    r.sort((a, b) => new Date(b.date) - new Date(a.date));
    return r;
  }, [source, clientFilter, q]);

  const columns = [
    { id: "date", header: "Date", accessor: (r) => fmtDate(r.date), sortable: true },
    { id: "client", header: "Client", accessor: (r) => (typeof r.clientId === "object" ? r.clientId?.name : r.clientId), sortable: true },
    { id: "case", header: "Case", accessor: (r) => (typeof r.caseId === "object" ? r.caseId?.name : r.caseId), sortable: true },
    { id: "category", header: "Category", accessor: (r) => r.category, sortable: true },
    { id: "description", header: "Description", accessor: (r) => r.description, width: 280 },
    { id: "hours", header: "Hours", accessor: (r) => (hoursOf(r) || 0).toFixed(2), align: "right", sortable: true },
    { id: "rate", header: "Rate", accessor: (r) => money(r.rate), align: "right" },
    { id: "amount", header: "Amount", accessor: (r) => money(r.amount || hoursOf(r) * (Number(r.rate) || 0)), align: "right" },
    { id: "billed", header: "Billed?", accessor: (r) => (<Badge>{r.invoiceId || r.status === "billed" ? "Yes" : "No"}</Badge>), width: 100 },
    { id: "action", header: "", accessor: (r) => (<Button variant="ghost" size="sm" onClick={() => setSelected(r)}>View</Button>) },
  ];

  const onPrint = () => {
    if (!selected) return;
    const css = `@media print { body * { visibility: hidden; } .printable, .printable * { visibility: visible; } .printable { position: absolute; inset: 0; width: 100%; box-shadow: none !important; } }`;
    const tag = document.createElement("style");
    tag.innerHTML = css;
    document.head.appendChild(tag);
    window.print();
    setTimeout(() => tag.remove(), 0);
  };

  return (
    <div className="lb-reset p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Billables</h1>
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input type="checkbox" className="rounded border-gray-300" checked={showUnbilledOnly} onChange={(e) => setShowUnbilledOnly(e.target.checked)} />
          <span className="text-sm text-gray-600">Unbilled only</span>
        </label>
      </div>

      <TableToolbar rightActions={[]}>
        <div className="flex items-center gap-3">
          <Select value={clientFilter} onChange={(e) => setClientFilter(e.target.value)}>
            <option value="">All clients</option>
            {clientOptions.map((c) => (<option key={c.value} value={c.value}>{c.label}</option>))}
          </Select>
          <Input placeholder="Search description, category, case…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </TableToolbar>

      <DataTable columns={columns} data={rows} loading={loading && !showUnbilledOnly} rowKey={(r) => r._id || r.id} skeleton={<SkeletonRows columns={columns} />} />

      {/* Preview modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title="Billable Preview">
        {selected && (
          <div ref={printRef} className="printable space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-lg font-semibold">{selected.category || "Billable"}</div>
                <div className="text-sm text-gray-500">{fmtDate(selected.date)}</div>
              </div>
              <Button onClick={onPrint}>Print</Button>
            </div>
            <div className="text-sm">
              <div><strong>Client:</strong> {typeof selected.clientId === "object" ? selected.clientId?.name : selected.clientId}</div>
              <div><strong>Case:</strong> {typeof selected.caseId === "object" ? selected.caseId?.name : selected.caseId}</div>
              <div><strong>Description:</strong> {selected.description}</div>
              <div><strong>Hours:</strong> {(hoursOf(selected) || 0).toFixed(2)}</div>
              <div><strong>Rate:</strong> {money(selected.rate)}</div>
              <div><strong>Amount:</strong> {money(selected.amount || hoursOf(selected) * (Number(selected.rate) || 0))}</div>
            </div>
          </div>
        )}
      </Modal>

      {error && <div className="mt-4 text-red-600">{String(error)}</div>}
    </div>
  );
}

/* ---- Role-aware wrapper (named export) ---- */
export function BillablesBase({ role="intern", readOnly=false, filters = {}, mode, currentUserId } = {}, props) {
  return <BillablesPage role={role} readOnly={readOnly} filters={filters} mode={mode} currentUserId={currentUserId} {...props} />;
}
