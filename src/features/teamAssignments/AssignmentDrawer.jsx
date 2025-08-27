import React, { useEffect, useState } from "react";
import { Drawer, Button } from "@/components/common";
import { Input, Select, TextArea } from "@/components/form";

const ROLE_OPTS = ["Admin","Attorney","Paralegal","Billing"];
// TODO: hydrate with real lists
const CLIENTS = Array.from({ length: 8 }).map((_,i)=>`Client ${i}`);
const CASES   = Array.from({ length: 10 }).map((_,i)=>`Case ${i}`);

export default function AssignmentDrawer({ open, user, onClose, onSave }) {
  const [form, setForm] = useState({ name:"", email:"", role:"Attorney", clients:[], cases:[], note:"" });

  useEffect(()=>{
    if (user) {
      setForm({
        name: user.name || "",
        email: user.email || "",
        role: user.role || "Attorney",
        clients: user.clients || [],
        cases: user.cases || [],
        note: "",
      });
    }
  }, [user]);

  const toggleMulti = (list, value) =>
    list.includes(value) ? list.filter(v=>v!==value) : [...list, value];

  return (
    <Drawer open={open} onClose={onClose} title={user?.id ? "Edit User" : "Invite User"} side="right" width={560}>
      {!user ? null : (
        <div className="space-y-5">
          <Input label="Name" value={form.name} onChange={(e)=>setForm(f=>({ ...f, name:e.target.value }))} />
          <Input label="Email" type="email" value={form.email} onChange={(e)=>setForm(f=>({ ...f, email:e.target.value }))} />
          <Select label="Role" value={form.role} onChange={(e)=>setForm(f=>({ ...f, role:e.target.value }))}>
            {ROLE_OPTS.map(r=><option key={r} value={r}>{r}</option>)}
          </Select>

          <div>
            <div className="block font-medium mb-1">Assign Clients</div>
            <div className="flex flex-wrap gap-2">
              {CLIENTS.map(c=>(
                <button key={c}
                  className={`px-2 py-1 rounded border ${form.clients.includes(c)?'bg-[color:var(--lb-surface)]':'bg-[color:var(--lb-bg)]'}`}
                  onClick={()=>setForm(f=>({ ...f, clients: toggleMulti(f.clients, c) }))}
                  type="button"
                >{c}</button>
              ))}
            </div>
          </div>

          <div>
            <div className="block font-medium mb-1">Assign Cases</div>
            <div className="flex flex-wrap gap-2">
              {CASES.map(c=>(
                <button key={c}
                  className={`px-2 py-1 rounded border ${form.cases.includes(c)?'bg-[color:var(--lb-surface)]':'bg-[color:var(--lb-bg)]'}`}
                  onClick={()=>setForm(f=>({ ...f, cases: toggleMulti(f.cases, c) }))}
                  type="button"
                >{c}</button>
              ))}
            </div>
          </div>

          <TextArea label="Note (optional)" rows={3} value={form.note} onChange={(e)=>setForm(f=>({ ...f, note:e.target.value }))} />

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button onClick={()=>onSave?.({ ...(user?.id?{ id:user.id }:{}), ...form })}>Save</Button>
          </div>
        </div>
      )}
    </Drawer>
  );
}
