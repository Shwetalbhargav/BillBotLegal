import React, { useEffect, useState } from "react";
import { Drawer, Button } from "@/components/common";
import { Input, Select, Switch } from "@/components/form";

const ROLES = ["Admin","Attorney","Paralegal","Billing"];

export default function AdminDrawer({ open, user, onClose, onSave }) {
  const [form, setForm] = useState({ name:"", email:"", role:"Attorney", active:true, orgWideBilling:false });

  useEffect(()=>{
    if (user) {
      setForm({
        name: user.name || "",
        email: user.email || "",
        role: user.role || "Attorney",
        active: user.status ? user.status!=="Suspended" : true,
        orgWideBilling: false,
      });
    }
  }, [user]);

  return (
    <Drawer open={open} onClose={onClose} title={user?.id ? "Edit User" : "Create User"} side="right" width={520}>
      {!user ? null : (
        <div className="space-y-5">
          <Input label="Name" value={form.name} onChange={(e)=>setForm(f=>({ ...f, name:e.target.value }))} />
          <Input label="Email" type="email" value={form.email} onChange={(e)=>setForm(f=>({ ...f, email:e.target.value }))} />
          <Select label="Role" value={form.role} onChange={(e)=>setForm(f=>({ ...f, role:e.target.value }))}>
            {ROLES.map(r=><option key={r} value={r}>{r}</option>)}
          </Select>
          <div className="flex items-center justify-between">
            <div className="font-medium">Active</div>
            <Switch checked={form.active} onChange={(v)=>setForm(f=>({ ...f, active:v }))} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Org‑wide Billing Controls</div>
              <div className="lb-help">Allow this user to edit rates & firm‑level billing settings</div>
            </div>
            <Switch checked={form.orgWideBilling} onChange={(v)=>setForm(f=>({ ...f, orgWideBilling:v }))} />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button onClick={()=>onSave?.({ ...(user?.id?{ id:user.id }:{}), ...form })}>Save</Button>
          </div>
        </div>
      )}
    </Drawer>
  );
}
