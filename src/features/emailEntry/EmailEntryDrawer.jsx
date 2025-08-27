import React, { useEffect, useState } from "react";
import { Drawer, Button } from "@/components/common";
import { Input, TextArea, NumberInput, Select } from "@/components/forms";

const ACTIVITY_CODES = [
  { value: "EMAIL", label: "Email" },
  { value: "CALL", label: "Call" },
  { value: "MEETING", label: "Meeting" },
  { value: "DOC_REVIEW", label: "Document Review" },
];

export default function EmailEntryDrawer({ open, entry, onClose, onSave }) {
  const [form, setForm] = useState({
    subject: "",
    summary: "",
    hours: 0.1,
    activityCode: "EMAIL",
  });

  useEffect(() => {
    if (entry) {
      setForm({
        subject: entry.subject || "",
        summary: entry.summary || "",
        hours: entry.hours ?? 0.1,
        activityCode: entry.activityCode || "EMAIL",
      });
    }
  }, [entry]);

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  return (
    <Drawer open={open} onClose={onClose} title="Edit Email Entry" side="right" width={520}>
      {!entry ? null : (
        <div className="space-y-5">
          <Input label="Subject" value={form.subject} onChange={(e)=>set("subject", e.target.value)} />
          <TextArea label="Billable Summary" rows={6} value={form.summary} onChange={(e)=>set("summary", e.target.value)} />
          <NumberInput
            label="Hours"
            step={0.1}
            precision={1}
            min={0}
            value={form.hours}
            onChange={(e)=>set("hours", Number(e.target.value))}
          />
          <Select label="Activity Code" value={form.activityCode} onChange={(e)=>set("activityCode", e.target.value)}>
            {ACTIVITY_CODES.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </Select>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button onClick={()=>onSave?.({ ...entry, ...form })}>Save</Button>
          </div>
        </div>
      )}
    </Drawer>
  );
}
