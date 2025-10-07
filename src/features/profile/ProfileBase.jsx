
// src/features/profile/ProfileBase.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/common";
import { Input, TextArea } from "@/components/form";
import { selectMe, updateMeThunk } from "@/store/usersSlice";

function avatarFor(user) {
  const role = String(user?.role || "user").toLowerCase();
  const base1 = "/assets/photos";        // preferred
  const base2 = "/assests/photos";       // typo-safe per project note
  const slug = String(user?.username || (user?.name || "user").split(" ")[0] || "user").toLowerCase();
  if (user?.avatar) return user.avatar;
  return `${base1}/${role}/${slug}.jpg`;
}

export default function ProfileBase({ title, sliceThunks }) {
  const dispatch = useDispatch();
  const me = useSelector(selectMe);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", bio: "" });

  // If a role-specific API exists (sliceThunks.fetchMine), call it; otherwise fall back to users/me in store
  useEffect(() => { if (sliceThunks?.fetchMine) dispatch(sliceThunks.fetchMine()); }, [dispatch]);
  useEffect(() => {
    if (me) setForm({ name: me.name || "", email: me.email || "", phone: me.phone || me.mobile || "", bio: me.bio || "" });
  }, [me]);

  const avatar = useMemo(() => avatarFor(me), [me]);

  async function onSave() {
    if (sliceThunks?.updateMine) {
      await dispatch(sliceThunks.updateMine(form));
    } else {
      await dispatch(updateMeThunk(form));
    }
    setEditing(false);
  }

  return (
    <div className="lb-reset p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">{title}</h1>
        {!editing ? (
          <Button onClick={() => setEditing(true)}>Edit Profile</Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setEditing(false)}>Cancel</Button>
            <Button onClick={onSave}>Save</Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <div className="rounded-2xl border border-[color:var(--lb-border)] bg-[color:var(--lb-surface)] p-4">
            <div className="flex flex-col items-center gap-3">
              <img src={avatar} alt="Avatar" className="h-28 w-28 rounded-full object-cover border" />
              <div className="text-center">
                <div className="font-semibold text-lg">{me?.name || "—"}</div>
                <div className="text-sm text-[color:var(--lb-muted)] capitalize">{me?.role || "user"}</div>
              </div>
              <div className="text-sm text-center text-[color:var(--lb-muted)]">{me?.email}</div>
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="rounded-2xl border border-[color:var(--lb-border)] bg-[color:var(--lb-surface)] p-4 space-y-4">
            <Field label="Full Name">{editing ? <Input value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} /> : <span className="font-medium">{me?.name || "—"}</span>}</Field>
            <Field label="Email">{editing ? <Input value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} /> : <span className="font-medium">{me?.email || "—"}</span>}</Field>
            <Field label="Phone">{editing ? <Input value={form.phone} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))} /> : <span className="font-medium">{me?.phone || me?.mobile || "—"}</span>}</Field>
            <Field label="Bio">{editing ? <TextArea rows={5} value={form.bio} onChange={(e) => setForm(f => ({ ...f, bio: e.target.value }))} /> : <div className="whitespace-pre-wrap">{me?.bio || "—"}</div>}</Field>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <div className="text-sm text-[color:var(--lb-muted)] mb-1">{label}</div>
      {children}
    </div>
  );
}
