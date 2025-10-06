// ===============================
// File: features/admin/Cases.jsx
// ===============================
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCases as fetchCasesThunk, createCase as createCaseThunk, editCase as editCaseThunk, removeCase as removeCaseThunk } from "@/store/caseSlice";
import { getClients, listCaseTypes } from "@/services/api";
import { Button, Modal, ConfirmDialog, ToastProvider, useToast, Loader, Card, Heading, EmptyState } from "@/components/ui";
import { Input, TextArea, Select, Form, FormField, FormLabel, FormHelp } from "@/components/forms";

const initialCase = { title: "", clientId: "", caseType: "", status: "Open", description: "" };

export function Cases() {
  const dispatch = useDispatch();
  const { list, loading, error } = useSelector((s) => s.cases || { list: [], loading: false, error: null });
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState(null); // { id, title }
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(initialCase);
  const [clients, setClients] = useState([]);
  const [caseTypes, setCaseTypes] = useState([]);
  const { pushToast } = useToast?.() || { pushToast: () => {} };

  useEffect(() => {
    dispatch(fetchCasesThunk());
    (async () => {
      try {
        const [{ data: clientsData }, { data: caseTypesData }] = await Promise.all([
          getClients(),
          listCaseTypes(),
        ]);
        setClients(clientsData || []);
        setCaseTypes(caseTypesData || []);
      } catch (e) {
        // not critical to page render
      }
    })();
  }, [dispatch]);

  const rows = useMemo(() => list || [], [list]);

  const startCreate = () => { setEditing(null); setForm(initialCase); setOpen(true); };
  const startEdit = (kase) => { setEditing(kase); setForm({
    title: kase.title || "",
    clientId: kase.clientId || kase.client?._id || "",
    caseType: kase.caseType || "",
    status: kase.status || "Open",
    description: kase.description || "",
  }); setOpen(true); };

  const onSubmit = async (e) => {
    e?.preventDefault?.();
    try {
      if (editing?._id) {
        await dispatch(editCaseThunk({ id: editing._id, caseData: form })).unwrap();
        pushToast?.({ title: "Case updated", description: `${form.title}` });
      } else {
        await dispatch(createCaseThunk(form)).unwrap();
        pushToast?.({ title: "Case created", description: `${form.title}` });
      }
      setOpen(false);
    } catch (err) {
      pushToast?.({ title: "Error", description: err?.message || "Failed to save case", variant: "destructive" });
    }
  };

  const onDelete = async (id) => {
    try {
      await dispatch(removeCaseThunk(id)).unwrap();
      pushToast?.({ title: "Case removed" });
    } catch (err) {
      pushToast?.({ title: "Error", description: err?.message || "Failed to delete case", variant: "destructive" });
    } finally {
      setConfirm(null);
    }
  };

  return (
    <ToastProvider>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Heading level={2} className="text-2xl font-semibold">Cases</Heading>
          <Button onClick={startCreate}>New Case</Button>
        </div>

        <Card className="p-0 overflow-hidden">
          {loading ? (
            <div className="p-8 flex items-center justify-center"><Loader /></div>
          ) : rows.length === 0 ? (
            <EmptyState
              title="No cases yet"
              description="Create your first case and start attaching billables."
              action={<Button onClick={startCreate}>Create case</Button>}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Title</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Client</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {rows.map((k) => (
                    <tr key={k._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap font-medium">{k.title}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{k.client?.name || k.clientName || "—"}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{k.caseType}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{k.status}</td>
                      <td className="px-4 py-3 text-right space-x-2">
                        <Button variant="ghost" onClick={() => startEdit(k)}>Edit</Button>
                        <Button variant="destructive" onClick={() => setConfirm({ id: k._id, title: k.title })}>Delete</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {error && (
            <div className="p-4 text-sm text-red-600">{error}</div>
          )}
        </Card>

        {/* Create / Edit Modal */}
        <Modal open={open} onClose={() => setOpen(false)} title={editing ? "Edit Case" : "New Case"}>
          <Form onSubmit={onSubmit} className="space-y-4">
            <FormField>
              <FormLabel>Title</FormLabel>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </FormField>

            <FormField>
              <FormLabel>Client</FormLabel>
              <Select value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })} required>
                <option value="" disabled>Select a client</option>
                {clients.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </Select>
              <FormHelp>Cases must be associated with a client.</FormHelp>
            </FormField>

            <FormField>
              <FormLabel>Case Type</FormLabel>
              <Select value={form.caseType} onChange={(e) => setForm({ ...form, caseType: e.target.value })}>
                <option value="">Select a type</option>
                {caseTypes.map((t) => (
                  <option key={t.value || t._id || t} value={t.value || t._id || t.label || t}>{t.label || t.name || t}</option>
                ))}
              </Select>
            </FormField>

            <FormField>
              <FormLabel>Status</FormLabel>
              <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                {['Open', 'Pending', 'On Hold', 'Closed'].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </Select>
            </FormField>

            <FormField>
              <FormLabel>Description</FormLabel>
              <TextArea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </FormField>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" type="button" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit">{editing ? "Save changes" : "Create case"}</Button>
            </div>
          </Form>
        </Modal>

        {/* Delete confirm */}
        <ConfirmDialog
          open={!!confirm}
          title="Delete case?"
          description={confirm ? `This will permanently remove “${confirm.title}”.` : ""}
          confirmLabel="Delete"
          onCancel={() => setConfirm(null)}
          onConfirm={() => onDelete(confirm.id)}
        />
      </div>
    </ToastProvider>
  );
}

