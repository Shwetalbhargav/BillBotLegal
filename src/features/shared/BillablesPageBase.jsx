// src/features/BillablesPage.jsx — soft UI + UX polish
import React, { useEffect, useMemo, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchBillables } from "@/store/billableSlice";
import { getUnbilledAnalytics } from "@/services/api";

import { Input, Select } from "@/components/form";
import { Button, Badge, Modal } from "@/components/common";
import { DataTable, TableToolbar, SkeletonRows } from "@/components/table";

const money = (n, c = "INR") =>
  isFinite(Number(n))
    ? new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: c,
      }).format(Number(n))
    : "—";
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString() : "—");
const hoursOf = (b) =>
  typeof b.durationHours === "number"
    ? b.durationHours
    : Number(b.durationMinutes || 0) / 60;

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

export default function BillablesPage(
  { role = "intern", readOnly = false, filters: externalFilters = {}, mode, currentUserId } = {}
) {
  const perms = derivePermissions(role, readOnly);

  const dispatch = useDispatch();
  const { list = [], loading, error } = useSelector((s) => s.billables || {});
  const [clientFilter, setClientFilter] = useState("");
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState(null);
  const [showUnbilledOnly, setShowUnbilledOnly] = useState(false);
  const [unbilled, setUnbilled] = useState([]);
  const printRef = useRef(null);

  useEffect(() => {
    dispatch(fetchBillables());
  }, [dispatch]);

  useEffect(() => {
    if (!showUnbilledOnly) return;
    (async () => {
      try {
        const res = await getUnbilledAnalytics();
        const arr = Array.isArray(res?.data?.items)
          ? res.data.items
          : Array.isArray(res?.data)
          ? res.data
          : [];
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
      const cid =
        typeof b.clientId === "object" ? b.clientId?._id : b.clientId;
      const cname =
        typeof b.clientId === "object"
          ? b.clientId?.name || cid
          : b.clientId || cid;
      if (cid && !map.has(cid)) map.set(cid, cname);
    }
    return Array.from(map, ([value, label]) => ({ value, label }));
  }, [source]);

  // filtered rows
  const rows = useMemo(() => {
    let r = Array.isArray(source) ? [...source] : [];
    if (clientFilter) {
      r = r.filter((b) => {
        const cid =
          typeof b.clientId === "object" ? b.clientId?._id : b.clientId;
        return cid === clientFilter;
      });
    }
    if (q.trim()) {
      const t = q.toLowerCase();
      r = r.filter(
        (b) =>
          String(b.description || "").toLowerCase().includes(t) ||
          String(b.category || "").toLowerCase().includes(t) ||
          String(
            (typeof b.caseId === "object" ? b.caseId?.name : b.caseId) || ""
          )
            .toLowerCase()
            .includes(t)
      );
    }
    r.sort((a, b) => new Date(b.date) - new Date(a.date));
    return r;
  }, [source, clientFilter, q]);

  const columns = [
    {
      id: "date",
      header: "Date",
      accessor: (r) => fmtDate(r.date),
      sortable: true,
    },
    {
      id: "client",
      header: "Client",
      accessor: (r) =>
        typeof r.clientId === "object" ? r.clientId?.name : r.clientId,
      sortable: true,
    },
    {
      id: "case",
      header: "Case",
      accessor: (r) =>
        typeof r.caseId === "object" ? r.caseId?.name : r.caseId,
      sortable: true,
    },
    {
      id: "category",
      header: "Category",
      accessor: (r) => r.category,
      sortable: true,
    },
    {
      id: "description",
      header: "Description",
      accessor: (r) => r.description,
      width: 280,
    },
    {
      id: "hours",
      header: "Hours",
      accessor: (r) => (hoursOf(r) || 0).toFixed(2),
      align: "right",
      sortable: true,
    },
    {
      id: "rate",
      header: "Rate",
      accessor: (r) => money(r.rate),
      align: "right",
    },
    {
      id: "amount",
      header: "Amount",
      accessor: (r) =>
        money(r.amount || hoursOf(r) * (Number(r.rate) || 0)),
      align: "right",
    },
    {
      id: "billed",
      header: "Billed?",
      accessor: (r) => (
        <Badge
          className={
            r.invoiceId || r.status === "billed"
              ? "rounded-full text-xs px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100"
              : "rounded-full text-xs px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-100"
          }
        >
          {r.invoiceId || r.status === "billed" ? "Yes" : "No"}
        </Badge>
      ),
      width: 110,
    },
    {
      id: "action",
      header: "",
      accessor: (r) => (
        <Button
          variant="ghost"
          size="sm"
          className="rounded-full text-xs px-3"
          onClick={() => setSelected(r)}
        >
          View
        </Button>
      ),
    },
  ];

  const onPrint = () => {
    if (!selected) return;
    const css = `
      @media print {
        body * { visibility: hidden; }
        .printable, .printable * { visibility: visible; }
        .printable {
          position: absolute;
          inset: 0;
          width: 100%;
          box-shadow: none !important;
          border-radius: 0 !important;
        }
      }`;
    const tag = document.createElement("style");
    tag.innerHTML = css;
    document.head.appendChild(tag);
    window.print();
    setTimeout(() => tag.remove(), 0);
  };

  return (
    <div className="lb-reset min-h-screen px-4 py-6 bg-[color:var(--lb-app-bg,#f3f4f6)]">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Soft header card */}
        <div className="rounded-[2rem] border border-[color:var(--lb-border)] bg-[color:var(--lb-surface)] shadow-[0_18px_45px_rgba(15,23,42,0.08)] px-5 py-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[0.7rem] uppercase tracking-[0.16em] text-[color:var(--lb-muted)] mb-1">
              Time & Billing
            </p>
            <h1 className="text-2xl md:text-3xl font-semibold">
              Billable Time Entries
            </h1>
            <p className="text-sm text-[color:var(--lb-muted)] mt-1">
              Quickly review, filter, and preview billable work across your
              cases.
            </p>
          </div>

          {/* Unbilled toggle – soft pill */}
          <button
            type="button"
            onClick={() => setShowUnbilledOnly((v) => !v)}
            className={`inline-flex items-center gap-3 rounded-full px-3 py-1.5 text-xs font-medium border transition-all duration-150 shadow-[0_10px_30px_rgba(15,23,42,0.14)] ${
              showUnbilledOnly
                ? "bg-emerald-500 text-white border-emerald-500"
                : "bg-[color:var(--lb-surface)] text-[color:var(--lb-muted)] border-[color:var(--lb-border)]"
            }`}
          >
            <span
              className={`relative inline-flex h-4 w-7 items-center rounded-full bg-white/20 border border-white/40 transition-colors ${
                showUnbilledOnly ? "justify-end" : "justify-start"
              }`}
            >
              <span className="h-3 w-3 rounded-full bg-white shadow-[0_4px_10px_rgba(15,23,42,0.35)]" />
            </span>
            <span>Show unbilled only</span>
          </button>
        </div>

        {/* Filters + table card */}
        <div className="rounded-[2rem] border border-[color:var(--lb-border)] bg-[color:var(--lb-surface)] shadow-[0_18px_45px_rgba(15,23,42,0.06)] px-5 py-5 space-y-5">
          <TableToolbar
            rightActions={[]}
            className="!border-none !px-0 !pt-0 !pb-3"
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between w-full">
              <div className="flex flex-wrap gap-3 items-center">
                <Select
                  value={clientFilter}
                  onChange={(e) => setClientFilter(e.target.value)}
                  className="min-w-[180px] rounded-full"
                >
                  <option value="">All clients</option>
                  {clientOptions.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </Select>

                <Input
                  placeholder="Search description, category, or case…"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  className="rounded-full md:min-w-[260px]"
                />
              </div>

              <div className="text-xs text-[color:var(--lb-muted)] md:text-right">
                {rows.length} entr{rows.length === 1 ? "y" : "ies"} shown
              </div>
            </div>
          </TableToolbar>

          <div className="rounded-[1.75rem] border border-[color:var(--lb-border)] bg-[color:var(--lb-surface)] overflow-hidden shadow-[0_12px_32px_rgba(15,23,42,0.04)]">
            <DataTable
              columns={columns}
              data={rows}
              loading={loading && !showUnbilledOnly}
              rowKey={(r) => r._id || r.id}
              skeleton={<SkeletonRows columns={columns} />}
              stickyHeader
            />
          </div>

          {error && (
            <div className="mt-3 rounded-2xl border border-red-200 bg-red-50/80 px-4 py-3 text-sm text-red-700 shadow-[0_12px_32px_rgba(248,113,113,0.35)]">
              {String(error)}
            </div>
          )}
        </div>
      </div>

      {/* Preview modal */}
      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title="Billable Preview"
      >
        {selected && (
          <div
            ref={printRef}
            className="printable space-y-4 rounded-2xl border border-[color:var(--lb-border)] bg-[color:var(--lb-surface)] px-4 py-4 shadow-[0_14px_32px_rgba(15,23,42,0.18)]"
          >
            <div className="flex justify-between items-start gap-3">
              <div>
                <div className="text-lg font-semibold">
                  {selected.category || "Billable"}
                </div>
                <div className="text-sm text-[color:var(--lb-muted)]">
                  {fmtDate(selected.date)}
                </div>
              </div>
              <Button
                onClick={onPrint}
                className="rounded-full px-4 text-sm shadow-[0_10px_24px_rgba(15,23,42,0.18)]"
              >
                Print
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 text-sm">
              <DetailRow
                label="Client"
                value={
                  typeof selected.clientId === "object"
                    ? selected.clientId?.name
                    : selected.clientId
                }
              />
              <DetailRow
                label="Case"
                value={
                  typeof selected.caseId === "object"
                    ? selected.caseId?.name
                    : selected.caseId
                }
              />
              <DetailRow label="Hours" value={(hoursOf(selected) || 0).toFixed(2)} />
              <DetailRow label="Rate" value={money(selected.rate)} />
              <DetailRow
                label="Amount"
                value={money(
                  selected.amount ||
                    hoursOf(selected) * (Number(selected.rate) || 0)
                )}
              />
              <DetailRow
                label="Billed?"
                value={
                  selected.invoiceId || selected.status === "billed"
                    ? "Yes"
                    : "No"
                }
              />
            </div>

            <div className="pt-3 border-t border-[color:var(--lb-border)] text-sm">
              <div className="text-[0.75rem] uppercase tracking-[0.16em] text-[color:var(--lb-muted)] mb-1">
                Description
              </div>
              <p className="text-[color:var(--lb-fg,#111827)] whitespace-pre-wrap leading-relaxed">
                {selected.description || "No description provided."}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex flex-col">
      <span className="text-[0.7rem] uppercase tracking-[0.12em] text-[color:var(--lb-muted)] mb-0.5">
        {label}
      </span>
      <span className="font-medium text-[color:var(--lb-fg,#111827)]">
        {value || "—"}
      </span>
    </div>
  );
}

/* ---- Role-aware wrapper (named export) ---- */
export function BillablesBase(
  { role = "intern", readOnly = false, filters = {}, mode, currentUserId } = {},
  props
) {
  return (
    <BillablesPage
      role={role}
      readOnly={readOnly}
      filters={filters}
      mode={mode}
      currentUserId={currentUserId}
      {...props}
    />
  );
}
