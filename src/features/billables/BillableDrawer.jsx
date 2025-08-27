import React, { useEffect } from "react";
import { Drawer } from "@/components/common";
import { Input, TextArea, NumberInput, Select } from "@/components/form";
import { Button } from "@/components/common";

const ACTIVITY_CODES = [
  { value: "EMAIL", label: "Email" },
  { value: "CALL", label: "Call" },
  { value: "MEETING", label: "Meeting" },
  { value: "DOC_REVIEW", label: "Document Review" },
];

export default function BillableDrawer({ open, billable, onClose, onSave }) {
  const [form, setForm] = React.useState({
    subject: "",
    summary: "",
    hours: 0.1,
    activityCode: "EMAIL",
  });

  useEffect(() => {
    if (billable) {
      setForm({
        subject: billable.subject || "",
        summary: billable.summary || "",
        hours: billable.hours ?? 0.1,
        activityCode: billable.activityCode || "EMAIL",
      });
    }
  }, [billable]);

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  return (
    <Drawer open={open} onClose={onClose} title="Edit Billable" side="right" width={520}>
      {!billable ? null : (
        <div className="space-y-5">
          <Input label="Subject" value={form.subject} onChange={(e)=>set("subject", e.target.value)} />
          <TextArea label="Summary" rows={6} value={form.summary} onChange={(e)=>set("summary", e.target.value)} />
          <NumberInput
            label="Hours"
            step={0.1}
            precision={1}
            min={0}
            value={form.hours}
            onChange={(e)=>set("hours", Number(e.target.value))}
          />
          <Select
            label="Activity Code"
            value={form.activityCode}
            onChange={(e)=>set("activityCode", e.target.value)}
          >
            {ACTIVITY_CODES.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </Select>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button onClick={()=>onSave?.({ ...billable, ...form })}>Save</Button>
          </div>
        </div>
      )}
    </Drawer>
  );
}
