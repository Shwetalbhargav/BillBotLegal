// src/features/shared/EmailEntriesPageBase.jsx

import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addEmail,
  createActivityFromEmail,
  createTimeEntryFromEmail,
  fetchEmails,
  mapEmail,
  regenerateNarrative,
  syncZoho,
} from "@/store/emailSlice";
import {
  fetchZohoStatus,
  openZohoConnectPage,
  syncZohoCasesThunk,
  syncZohoClientsThunk,
} from "@/store/zohoSlice";

import { Button, Drawer } from "@/components/common";
import { Input, Select, DatePicker } from "@/components/form";
import { DataTable, TableToolbar } from "@/components/table";

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

export default function EmailEntriesPage({
  role = "intern",
  readOnly = false,
  filters: _externalFilters = {},
  mode,
  currentUserId,
} = {}) {
  const perms = derivePermissions(role, readOnly);
  const dispatch = useDispatch();

  const {
    list = [],
    loading,
    error,
    creating,
    createError,
    mapping,
    mapError,
    narrativeLoading,
    narrativeError,
    pushing,
    pushError,
    activityCreating,
    activityError,
    timeEntryCreating,
    timeEntryError,
  } = useSelector((s) => s.emails || {});
  const {
    status: zohoStatus,
    loadingStatus: zohoLoadingStatus,
    loadingSync: zohoLoadingSync,
    error: zohoError,
    lastSyncResult: zohoLastSyncResult,
  } = useSelector((s) => s.zoho || {});

  const empty = {
    subject: "",
    recipient: "",
    userEmail: "",
    userId: currentUserId || "",
    clientId: "",
    caseId: "",
    minutes: "",
    body: "",
    summary: "",
    date: "",
  };

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sort, setSort] = useState(null);
  const [filters, setFilters] = useState({
    q: "",
    status: "",
    from: "",
    to: "",
  });
  const [open, setOpen] = useState(false);
  const [viewMode, setViewMode] = useState("create");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    dispatch(fetchEmails());
    dispatch(fetchZohoStatus());
  }, [dispatch]);

  const rows = useMemo(
    () =>
      (Array.isArray(list) ? list : []).map((entry) => {
        const meta = entry.meta || {};
        const clientId = getId(entry.clientId || entry.client);
        const caseId = getId(entry.caseId || entry.case);

        return {
          id: entry._id || entry.id,
          subject: entry.subject || entry.threadSubject || "(no subject)",
          recipient: entry.recipient || "",
          clientId,
          caseId,
          clientName:
            entry.clientName ||
            entry.client?.name ||
            entry.clientId?.name ||
            asDisplayValue(entry.clientId) ||
            "Unmapped",
          caseName:
            entry.caseName ||
            entry.case?.title ||
            entry.case?.name ||
            entry.caseId?.title ||
            entry.caseId?.name ||
            asDisplayValue(entry.caseId) ||
            "Unmapped",
          minutes: Number(
            entry.typingTimeMinutes ??
              entry.durationMinutes ??
              entry.minutes ??
              entry.duration ??
              0
          ),
          date: entry.date || entry.createdAt || null,
          status: entry.status || "Logged",
          body: entry.body || "",
          summary:
            entry.billableSummary || entry.summary || entry.description || "",
          mapped: Boolean(clientId || caseId),
          zohoSynced: Boolean(meta.zohoSynced),
          hasActivity: Boolean(meta.activityId),
          hasTimeEntry: Boolean(meta.timeEntryId),
          _raw: entry,
        };
      }),
    [list]
  );

  const filtered = useMemo(() => {
    let result = [...rows];
    const q = filters.q?.toLowerCase() || "";

    if (q) {
      result = result.filter(
        (row) =>
          String(row.subject).toLowerCase().includes(q) ||
          String(row.recipient).toLowerCase().includes(q) ||
          String(row.clientName).toLowerCase().includes(q) ||
          String(row.caseName).toLowerCase().includes(q) ||
          String(row.summary).toLowerCase().includes(q)
      );
    }
    if (filters.status) {
      result = result.filter(
        (row) => String(row.status).toLowerCase() === filters.status
      );
    }
    if (filters.from) {
      result = result.filter((row) => safeDate(row.date) >= safeDate(filters.from));
    }
    if (filters.to) {
      result = result.filter((row) => safeDate(row.date) <= safeDate(filters.to));
    }
    if (sort) {
      const { id, desc } = sort;
      result.sort((a, b) => compare(getCell(a, id), getCell(b, id), desc));
    }
    return result;
  }, [rows, filters, sort]);

  const total = filtered.length;
  const pageRows = useMemo(
    () => filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page, pageSize]
  );

  const columns = [
    {
      id: "subject",
      header: "Subject",
      accessor: (row) => (
        <button
          className="text-indigo-600 hover:text-indigo-700 hover:underline font-medium"
          onClick={() => openView(row)}
        >
          {row.subject}
        </button>
      ),
      sortable: true,
    },
    {
      id: "recipient",
      header: "Recipient",
      accessor: (row) => row.recipient || "-",
      sortable: true,
      width: 220,
    },
    {
      id: "client",
      header: "Client",
      accessor: (row) => row.clientName,
      sortable: true,
      width: 220,
    },
    {
      id: "case",
      header: "Case",
      accessor: (row) => row.caseName,
      sortable: true,
      width: 220,
    },
    {
      id: "minutes",
      header: "Minutes",
      accessor: (row) => row.minutes,
      align: "right",
      sortable: true,
      width: 120,
    },
    {
      id: "mapping",
      header: "Mapping",
      accessor: (row) => (
        <StatusPill
          tone={row.mapped ? "success" : "warning"}
          label={row.mapped ? "Mapped" : "Needs mapping"}
        />
      ),
      width: 140,
      sortable: false,
    },
    {
      id: "date",
      header: "Date",
      accessor: (row) => fmtDate(row.date),
      sortable: true,
      width: 140,
    },
    {
      id: "status",
      header: "Status",
      accessor: (row) => <StatusPill label={row.status} />,
      sortable: true,
      width: 120,
    },
    {
      id: "actions",
      header: "",
      accessor: (row) => (
        <Button
          variant="secondary"
          size="sm"
          loading={pushing}
          onClick={(event) => {
            event.stopPropagation();
            runAction("Synced to Zoho.", async () => {
              await dispatch(syncZoho(row.id)).unwrap();
            });
          }}
          disabled={!row.mapped || row.zohoSynced || pushing}
        >
          {row.zohoSynced ? "Synced" : "Sync to Zoho"}
        </Button>
      ),
      width: 150,
      sortable: false,
    },
  ];

  function getCell(row, id) {
    switch (id) {
      case "subject":
        return row.subject;
      case "recipient":
        return row.recipient;
      case "client":
        return row.clientName;
      case "case":
        return row.caseName;
      case "minutes":
        return Number(row.minutes || 0);
      case "date":
        return safeDate(row.date);
      case "status":
        return row.status || "";
      default:
        return row[id];
    }
  }

  function openCreate() {
    setNotice(null);
    setViewMode("create");
    setEditing(null);
    setForm(empty);
    setOpen(true);
  }

  function openView(row) {
    setNotice(null);
    setViewMode("view");
    setEditing(row);
    setForm({
      subject: row.subject || "",
      recipient: row.recipient || "",
      userEmail: row._raw?.userEmail || "",
      userId: getId(row._raw?.userId) || currentUserId || "",
      clientId: row.clientId || "",
      caseId: row.caseId || "",
      minutes: row.minutes || "",
      body: row.body || "",
      date: row.date || "",
      summary: row.summary || "",
    });
    setOpen(true);
  }

  async function onSubmit(event) {
    event.preventDefault();
    const payload = uiToPayload(form, currentUserId);

    await runAction("Email entry added.", async () => {
      await dispatch(addEmail(payload)).unwrap();
      setOpen(false);
      dispatch(fetchEmails());
    });
  }

  async function runAction(successMessage, action) {
    setNotice(null);
    try {
      await action();
      setNotice({ tone: "success", message: successMessage });
    } catch (err) {
      setNotice({
        tone: "error",
        message: typeof err === "string" ? err : err?.message || "Action failed.",
      });
    }
  }

  const actionError =
    createError ||
    mapError ||
    narrativeError ||
    pushError ||
    activityError ||
    timeEntryError;

  return (
    <div className="lb-reset min-h-full bg-slate-50/80">
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Email Entries
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Review client emails, map them to matters, convert them to work
              records, and sync context to Zoho CRM.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <ZohoStatusBadge
              status={zohoStatus}
              loading={zohoLoadingStatus}
              error={zohoError}
            />
            {!zohoStatus?.connected && (
              <Button
                variant="secondary"
                onClick={() => dispatch(openZohoConnectPage())}
              >
                Connect Zoho
              </Button>
            )}
            <Button
              variant="secondary"
              loading={zohoLoadingSync}
              disabled={zohoLoadingSync || !zohoStatus?.connected}
              onClick={() =>
                runAction("Zoho client sync started.", () =>
                  dispatch(syncZohoClientsThunk()).unwrap()
                )
              }
            >
              Sync Clients
            </Button>
            <Button
              variant="secondary"
              loading={zohoLoadingSync}
              disabled={zohoLoadingSync || !zohoStatus?.connected}
              onClick={() =>
                runAction("Zoho matter sync started.", () =>
                  dispatch(syncZohoCasesThunk()).unwrap()
                )
              }
            >
              Sync Matters
            </Button>
            <Button variant="secondary" onClick={() => dispatch(fetchEmails())}>
              Refresh
            </Button>
            {!perms.readOnly && perms.canEdit && (
              <Button onClick={openCreate}>New Entry</Button>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/70 bg-white/90 shadow-sm backdrop-blur-sm overflow-hidden">
          <div className="px-4 pt-4 pb-3 border-b border-slate-100">
            <TableToolbar>
              <Input
                placeholder="Search subject / recipient / client / case / summary..."
                value={filters.q}
                onChange={(event) => {
                  setPage(1);
                  setFilters({ ...filters, q: event.target.value });
                }}
                className="max-w-md"
              />
              <Select
                value={filters.status}
                onChange={(event) => {
                  setPage(1);
                  setFilters({ ...filters, status: event.target.value });
                }}
              >
                <option value="">All statuses</option>
                <option value="logged">Logged</option>
                <option value="failed">Failed</option>
                <option value="pending">Pending</option>
              </Select>
              <DatePicker
                label={null}
                placeholder="From"
                value={filters.from}
                onChange={(value) => {
                  setPage(1);
                  setFilters({ ...filters, from: value });
                }}
                size="sm"
              />
              <DatePicker
                label={null}
                placeholder="To"
                value={filters.to}
                onChange={(value) => {
                  setPage(1);
                  setFilters({ ...filters, to: value });
                }}
                size="sm"
              />
              <div className="grow" />
              <div className="hidden sm:flex items-center text-xs text-slate-500">
                Showing {pageRows.length} of {total} emails
              </div>
            </TableToolbar>
          </div>

          <div className="px-2 sm:px-4 pb-4">
            <DataTable
              columns={columns}
              data={pageRows}
              total={total}
              page={page}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setPage(1);
              }}
              sort={sort}
              onSortChange={setSort}
              rowKey={(row) => row.id}
              loading={!!loading}
              stickyHeader
            />
          </div>
        </div>

        {error && <Alert tone="error">{String(error)}</Alert>}
        {(notice || actionError) && (
          <Alert tone={notice?.tone === "success" ? "success" : "error"}>
            {notice?.message || actionError}
          </Alert>
        )}
        {zohoLastSyncResult && (
          <Alert tone="success">
            Zoho sync result: {formatSyncResult(zohoLastSyncResult)}
          </Alert>
        )}
      </div>

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title={viewMode === "create" ? "New Email Entry" : "Email Details"}
      >
        {viewMode === "view" ? (
          <div className="space-y-4 text-sm">
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50/60 px-3 py-3 space-y-2">
              <KV label="Subject" value={form.subject || "-"} />
              <KV label="Recipient" value={form.recipient || "-"} />
              <KV label="Client" value={editing?.clientName || "-"} />
              <KV label="Case" value={editing?.caseName || "-"} />
              <KV label="Minutes" value={String(form.minutes || 0)} />
              <KV label="Date" value={fmtDate(form.date)} />
              <KV label="Status" value={editing?.status || "Logged"} />
              <KV
                label="Activity"
                value={editing?.hasActivity ? "Created" : "Not created"}
              />
              <KV
                label="Time Entry"
                value={editing?.hasTimeEntry ? "Created" : "Not created"}
              />
              <KV label="Zoho" value={editing?.zohoSynced ? "Synced" : "Not synced"} />
            </div>

            <div className="grid grid-cols-1 gap-3 rounded-2xl border border-slate-200/70 bg-white px-3 py-3">
              <Input
                label="Client ID"
                value={form.clientId}
                onChange={(event) => setForm({ ...form, clientId: event.target.value })}
                placeholder="Mongo client ObjectId"
              />
              <Input
                label="Case ID"
                value={form.caseId}
                onChange={(event) => setForm({ ...form, caseId: event.target.value })}
                placeholder="Mongo case ObjectId"
              />
              <div className="flex flex-wrap justify-end gap-2">
                <Button
                  variant="secondary"
                  onClick={() =>
                    runAction("Email mapping saved.", async () => {
                      await dispatch(
                        mapEmail({
                          id: editing.id,
                          payload: compactPayload({
                            clientId: form.clientId,
                            caseId: form.caseId,
                          }),
                        })
                      ).unwrap();
                      dispatch(fetchEmails());
                    })
                  }
                  loading={mapping}
                  disabled={mapping || (!form.clientId && !form.caseId)}
                >
                  Save Mapping
                </Button>
                <Button
                  variant="secondary"
                  onClick={() =>
                    runAction("Narrative regenerated.", async () => {
                      await dispatch(regenerateNarrative(editing.id)).unwrap();
                      dispatch(fetchEmails());
                    })
                  }
                  loading={narrativeLoading}
                  disabled={narrativeLoading}
                >
                  Regenerate Narrative
                </Button>
              </div>
            </div>

            <TextBlock label="Summary" value={form.summary} />
            <TextBlock label="Body" value={form.body} scroll />

            <div className="flex flex-wrap justify-end gap-2 pt-4 border-t border-slate-200">
              <Button variant="secondary" onClick={() => setOpen(false)}>
                Close
              </Button>
              <Button
                variant="secondary"
                onClick={() =>
                  runAction("Activity created.", () =>
                    dispatch(createActivityFromEmail(editing.id)).unwrap()
                  )
                }
                loading={activityCreating}
                disabled={!editing?.mapped || editing?.hasActivity || activityCreating}
              >
                {editing?.hasActivity ? "Activity Created" : "Create Activity"}
              </Button>
              <Button
                variant="secondary"
                onClick={() =>
                  runAction("Time entry created.", () =>
                    dispatch(
                      createTimeEntryFromEmail({
                        id: editing.id,
                        payload: compactPayload({ date: form.date }),
                      })
                    ).unwrap()
                  )
                }
                loading={timeEntryCreating}
                disabled={!editing?.mapped || editing?.hasTimeEntry || timeEntryCreating}
              >
                {editing?.hasTimeEntry ? "Time Entry Created" : "Create Time Entry"}
              </Button>
              <Button
                onClick={() =>
                  runAction("Synced to Zoho.", async () => {
                    await dispatch(syncZoho(editing.id)).unwrap();
                    dispatch(fetchEmails());
                  })
                }
                loading={pushing}
                disabled={!editing?.mapped || editing?.zohoSynced || pushing}
              >
                {editing?.zohoSynced ? "Synced" : "Sync to Zoho"}
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <Input
              label="Subject"
              value={form.subject}
              onChange={(event) => setForm({ ...form, subject: event.target.value })}
              placeholder="Client follow-up"
            />
            <Input
              label="Recipient"
              value={form.recipient}
              onChange={(event) => setForm({ ...form, recipient: event.target.value })}
              placeholder="client@example.com"
              required
            />
            {!currentUserId && (
              <Input
                label="User Email"
                value={form.userEmail}
                onChange={(event) => setForm({ ...form, userEmail: event.target.value })}
                placeholder="lawyer@firm.com"
                required={!form.userId}
              />
            )}
            <Input
              label="User ID"
              value={form.userId}
              onChange={(event) => setForm({ ...form, userId: event.target.value })}
              placeholder="Optional Mongo user ObjectId"
            />
            <Input
              label="Typing Time Minutes"
              type="number"
              min="1"
              value={form.minutes}
              onChange={(event) => setForm({ ...form, minutes: event.target.value })}
              required
            />
            <Input
              label="Client ID"
              value={form.clientId}
              onChange={(event) => setForm({ ...form, clientId: event.target.value })}
              placeholder="Optional Mongo client ObjectId"
            />
            <Input
              label="Case ID"
              value={form.caseId}
              onChange={(event) => setForm({ ...form, caseId: event.target.value })}
              placeholder="Optional Mongo case ObjectId"
            />
            <DatePicker
              label="Date"
              value={form.date}
              onChange={(value) => setForm({ ...form, date: value })}
            />
            <Input
              label="Billable Summary"
              value={form.summary}
              onChange={(event) => setForm({ ...form, summary: event.target.value })}
              placeholder="Drafted response and reviewed attachments"
            />
            <label className="block">
              <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-600">
                Body
              </span>
              <textarea
                className="min-h-28 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                value={form.body}
                onChange={(event) => setForm({ ...form, body: event.target.value })}
                placeholder="Paste email body"
              />
            </label>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 mt-4">
              <Button variant="secondary" type="button" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={creating} disabled={creating}>
                Save
              </Button>
            </div>
          </form>
        )}
      </Drawer>
    </div>
  );
}

function fmtDate(value) {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleDateString();
  } catch {
    return String(value);
  }
}

function compare(a, b, desc) {
  if (a == null && b == null) return 0;
  if (a == null) return desc ? 1 : -1;
  if (b == null) return desc ? -1 : 1;
  if (typeof a === "number" && typeof b === "number") {
    return desc ? b - a : a - b;
  }
  return desc
    ? String(b).localeCompare(String(a))
    : String(a).localeCompare(String(b));
}

function safeDate(value) {
  try {
    return new Date(value).getTime();
  } catch {
    return 0;
  }
}

function uiToPayload(form, currentUserId) {
  return compactPayload({
    subject: form.subject,
    recipient: form.recipient,
    userId: form.userId || currentUserId,
    userEmail: form.userEmail,
    clientId: form.clientId,
    caseId: form.caseId,
    typingTimeMinutes: Number(form.minutes) || 0,
    date: form.date || null,
    body: form.body,
    billableSummary: form.billableSummary || form.summary || form.description || "",
  });
}

function compactPayload(payload) {
  return Object.fromEntries(
    Object.entries(payload).filter(
      ([, value]) => value !== undefined && value !== null && value !== ""
    )
  );
}

function getId(value) {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value._id || value.id || "";
}

function asDisplayValue(value) {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value.name || value.title || value.email || getId(value);
}

function KV({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-6">
      <span className="text-xs font-medium text-slate-500">{label}</span>
      <span className="font-medium text-slate-900">{value}</span>
    </div>
  );
}

function StatusPill({ label, tone = "neutral" }) {
  const tones = {
    neutral: "bg-slate-50 text-slate-700 border-slate-200/70",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200/70",
    warning: "bg-amber-50 text-amber-700 border-amber-200/70",
  };

  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border",
        tones[tone] || tones.neutral,
      ].join(" ")}
    >
      {label}
    </span>
  );
}

function ZohoStatusBadge({ status, loading, error }) {
  if (loading) return <StatusPill label="Checking Zoho" />;
  if (status?.connected) {
    const user =
      status.zohoUser?.users?.[0]?.email ||
      status.zohoUser?.email ||
      status.apiDomain ||
      "Connected";
    return <StatusPill tone="success" label={`Zoho: ${user}`} />;
  }
  if (error || status?.connected === false) {
    return <StatusPill tone="warning" label="Zoho not connected" />;
  }
  return <StatusPill label="Zoho unknown" />;
}

function formatSyncResult(result) {
  const parts = [];
  if (Array.isArray(result.clients)) {
    parts.push(`${countOk(result.clients)} clients ok`);
  }
  if (Array.isArray(result.cases)) {
    parts.push(`${countOk(result.cases)} matters ok`);
  }
  if (result.workdrive) {
    parts.push("WorkDrive linked");
  }
  return parts.length ? parts.join(", ") : "completed";
}

function countOk(items) {
  return items.filter((item) => item?.ok).length;
}

function Alert({ tone = "error", children }) {
  const toneClass =
    tone === "success"
      ? "border-emerald-200/70 bg-emerald-50 text-emerald-900"
      : "border-rose-200/70 bg-rose-50 text-rose-900";

  return (
    <div className={["rounded-2xl border px-3 py-2 text-sm", toneClass].join(" ")}>
      {children}
    </div>
  );
}

function TextBlock({ label, value, scroll = false }) {
  return (
    <div>
      <div className="text-xs font-medium text-slate-500 mb-1">{label}</div>
      <div
        className={[
          "rounded-2xl border border-slate-200/70 bg-white px-3 py-3 whitespace-pre-wrap text-sm text-slate-800",
          scroll ? "max-h-48 overflow-auto" : "",
        ].join(" ")}
      >
        {value || "-"}
      </div>
    </div>
  );
}

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
