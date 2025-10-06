// ===============================
// File: features/admin/Clients.jsx
// ===============================
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  fetchClientsThunk, 
  createClientThunk, 
  updateClientThunk, 
  deleteClientThunk 
} from "@/store/clientSlice";
import {
  Button,
  Modal,
  ConfirmDialog,
  ToastProvider,
  useToast,
  Loader,
  Card,
  Heading,
  EmptyState,
} from "@/components/ui"; // adjust barrel path to your project structure
import { 
  Input, 
  Form, 
  FormField, 
  FormLabel, 
  FormError, 
  FormHelp 
} from "@/components/forms";

const initialClient = { name: "", email: "", phone: "", organization: "" };

export default function Clients() {
  const dispatch = useDispatch();
  const { list, loading, error } = useSelector((s) => s.clients || { list: [], loading: false, error: null });
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState(null); // { id, name }
  const [editing, setEditing] = useState(null); // client object
  const [form, setForm] = useState(initialClient);
  const { pushToast } = useToast?.() || { pushToast: () => {} };

  useEffect(() => { dispatch(fetchClientsThunk()); }, [dispatch]);

  const rows = useMemo(() => list || [], [list]);

  const startCreate = () => { setEditing(null); setForm(initialClient); setOpen(true); };
  const startEdit = (client) => { setEditing(client); setForm({
    name: client.name || "",
    email: client.email || "",
    phone: client.phone || "",
    organization: client.organization || "",
  }); setOpen(true); };

  const onSubmit = async (e) => {
    e?.preventDefault?.();
    try {
      if (editing?._id) {
        await dispatch(updateClientThunk({ id: editing._id, client: form })).unwrap();
        pushToast?.({ title: "Client updated", description: `${form.name}` });
      } else {
        await dispatch(createClientThunk(form)).unwrap();
        pushToast?.({ title: "Client created", description: `${form.name}` });
      }
      setOpen(false);
    } catch (err) {
      pushToast?.({ title: "Error", description: err?.message || "Failed to save client", variant: "destructive" });
    }
  };

  const onDelete = async (id) => {
    try {
      await dispatch(deleteClientThunk(id)).unwrap();
      pushToast?.({ title: "Client removed" });
    } catch (err) {
      pushToast?.({ title: "Error", description: err?.message || "Failed to delete client", variant: "destructive" });
    } finally {
      setConfirm(null);
    }
  };

  return (
    <ToastProvider>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Heading level={2} className="text-2xl font-semibold">Clients</Heading>
          <Button onClick={startCreate}>New Client</Button>
        </div>

        <Card className="p-0 overflow-hidden">
          {loading ? (
            <div className="p-8 flex items-center justify-center"><Loader /></div>
          ) : rows.length === 0 ? (
            <EmptyState
              title="No clients yet"
              description="Create your first client to start attaching cases and billables."
              action={<Button onClick={startCreate}>Create client</Button>}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Phone</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Organization</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {rows.map((c) => (
                    <tr key={c._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap font-medium">{c.name}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{c.email}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{c.phone}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{c.organization}</td>
                      <td className="px-4 py-3 text-right space-x-2">
                        <Button variant="ghost" onClick={() => startEdit(c)}>Edit</Button>
                        <Button variant="destructive" onClick={() => setConfirm({ id: c._id, name: c.name })}>Delete</Button>
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
        <Modal open={open} onClose={() => setOpen(false)} title={editing ? "Edit Client" : "New Client"}>
          <Form onSubmit={onSubmit} className="space-y-4">
            <FormField>
              <FormLabel>Name</FormLabel>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              <FormHelp>Client full name or primary contact.</FormHelp>
            </FormField>
            <FormField>
              <FormLabel>Email</FormLabel>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </FormField>
            <FormField>
              <FormLabel>Phone</FormLabel>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </FormField>
            <FormField>
              <FormLabel>Organization</FormLabel>
              <Input value={form.organization} onChange={(e) => setForm({ ...form, organization: e.target.value })} />
            </FormField>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" type="button" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit">{editing ? "Save changes" : "Create client"}</Button>
            </div>
            <FormError />
          </Form>
        </Modal>

        {/* Delete confirm */}
        <ConfirmDialog
          open={!!confirm}
          title="Delete client?"
          description={confirm ? `This will permanently remove ${confirm.name} and cannot be undone.` : ""}
          confirmLabel="Delete"
          onCancel={() => setConfirm(null)}
          onConfirm={() => onDelete(confirm.id)}
        />
      </div>
    </ToastProvider>
  );
}


