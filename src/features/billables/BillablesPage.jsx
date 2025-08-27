import React, { useEffect, useMemo, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchBillables } from "@/store/billableSlice";
import { Input, Select } from "@/components/form";
import { Button, Badge, Modal } from "@/components/common";
import { DataTable, TableToolbar, SkeletonRows } from "@/components/table";

const money = (n, c="INR") =>
  isFinite(Number(n))
    ? new Intl.NumberFormat("en-IN", { style: "currency", currency: c }).format(Number(n))
    : "—";
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString() : "—");
const hours = (b) =>
  typeof b.durationHours === "number"
    ? b.durationHours
    : (Number(b.durationMinutes || 0) / 60);

export default function BillablesPage() {
  const dispatch = useDispatch();
  const { list = [], loading, error } = useSelector((s) => s.billables || {});
  const [clientFilter, setClientFilter] = useState("");
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState(null);
  const printRef = useRef(null);

  useEffect(() => { dispatch(fetchBillables()); }, [dispatch]);

  // build client dropdown
  const clientOptions = useMemo(() => {
    const map = new Map();
    for (const b of list) {
      const cid = typeof b.clientId === "object" ? b.clientId?._id : b.clientId;
      const cname = typeof b.clientId === "object" ? (b.clientId?.name || cid) : cid;
      if (cid && !map.has(cid)) map.set(cid, cname);
    }
    return Array.from(map, ([value, label]) => ({ value, label }));
  }, [list]);

  // filtered rows
  const rows = useMemo(() => {
    let r = Array.isArray(list) ? [...list] : [];
    if (clientFilter) {
      r = r.filter((b) => {
        const cid = typeof b.clientId === "object" ? b.clientId?._id : b.clientId;
        return cid === clientFilter;
      });
    }
    if (q.trim()) {
      const t = q.toLowerCase();
      r = r.filter((b) =>
        String(b.description || "").toLowerCase().includes(t) ||
        String(b.category || "").toLowerCase().includes(t) ||
        String((typeof b.caseId === "object" ? b.caseId?.name : b.caseId) || "")
          .toLowerCase()
          .includes(t)
      );
    }
    r.sort((a,b) => new Date(b.date) - new Date(a.date));
    return r;
  }, [list, clientFilter, q]);

  const columns = [
    { id: "date", header: "Date", accessor: (r) => fmtDate(r.date), sortable: true },
    {
      id: "client",
      header: "Client",
      accessor: (r) => typeof r.clientId === "object" ? r.clientId?.name : r.clientId,
      sortable: true,
    },
    {
      id: "case",
      header: "Case",
      accessor: (r) => typeof r.caseId === "object" ? r.caseId?.name : r.caseId,
      sortable: true,
    },
    { id: "category", header: "Category", accessor: (r) => r.category, sortable: true },
    { id: "description", header: "Description", accessor: (r) => r.description, width: 280 },
    {
      id: "hours",
      header: "Hours",
      accessor: (r) => hours(r).toFixed(2),
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
      accessor: (r) => money(r.amount),
      align: "right",
    },
    {
      id: "status",
      header: "Status",
      accessor: (r) => <Badge>{r.status || "Pending"}</Badge>,
    },
    {
      id: "action",
      header: "",
      accessor: (r) => (
        <Button variant="ghost" size="sm" onClick={() => setSelected(r)}>
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
      <h1 className="text-2xl font-semibold mb-4">Billables</h1>

      <TableToolbar
        rightActions={[]}
      >
        <div className="flex items-center gap-3">
          <Select
            value={clientFilter}
            onChange={(e) => setClientFilter(e.target.value)}
          >
            <option value="">All clients</option>
            {clientOptions.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </Select>
          <Input
            placeholder="Search description, category, case…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </TableToolbar>

      <DataTable
        columns={columns}
        data={rows}
        loading={loading}
        rowKey={(r) => r._id}
        skeleton={<SkeletonRows columns={columns} />}
      />

      {/* Preview modal */}
      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title="Billable Preview"
      >
        {selected && (
          <div ref={printRef} className="printable space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-lg font-semibold">{selected.category}</div>
                <div className="text-sm text-gray-500">{fmtDate(selected.date)}</div>
              </div>
              <Button onClick={onPrint}>Print</Button>
            </div>
            <div className="text-sm">
              <div><strong>Client:</strong> {typeof selected.clientId === "object" ? selected.clientId?.name : selected.clientId}</div>
              <div><strong>Case:</strong> {typeof selected.caseId === "object" ? selected.caseId?.name : selected.caseId}</div>
              <div><strong>Description:</strong> {selected.description}</div>
              <div><strong>Hours:</strong> {hours(selected).toFixed(2)}</div>
              <div><strong>Rate:</strong> {money(selected.rate)}</div>
              <div><strong>Amount:</strong> {money(selected.amount)}</div>
            </div>
          </div>
        )}
      </Modal>

      {error && <div className="mt-4 text-red-600">{String(error)}</div>}
    </div>
  );
}
