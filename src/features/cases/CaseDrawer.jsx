// CaseDrawer.jsx
import React, { useEffect, useState } from "react";

export default function CaseDrawer({ open, theCase, onClose, onSave }) {
  const empty = {
    name: "",
    description: "",
    clientId: "",
    status: "open",
    assignedUsers: [],
    primaryLawyerId: "",
  };
  const [values, setValues] = useState(empty);

  useEffect(() => {
    if (open) {
      setValues({
        ...empty,
        ...(theCase || {}),
        assignedUsers: Array.isArray(theCase?.assignedUsers) ? theCase.assignedUsers : [],
      });
    }
  }, [open]);

  const handleSave = () => {
    if (!values.name || !values.clientId) {
      alert("Case name and client are required.");
      return;
    }
    onSave?.(values);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/30 z-50">
      <div className="absolute right-0 top-0 h-full w-full max-w-xl bg-white shadow-xl p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">{values._id ? "Edit Case" : "New Case"}</h2>
          <button className="text-gray-500 hover:text-black" onClick={onClose}>✕</button>
        </div>

        <div className="space-y-4">
          <input
            className="w-full border px-3 py-2 rounded"
            placeholder="Case Name *"
            value={values.name}
            onChange={(e)=>setValues(v=>({ ...v, name: e.target.value }))}
          />
          <input
            className="w-full border px-3 py-2 rounded"
            placeholder="Description"
            value={values.description || ""}
            onChange={(e)=>setValues(v=>({ ...v, description: e.target.value }))}
          />
          <input
            className="w-full border px-3 py-2 rounded"
            placeholder="Client ID *"
            value={values.clientId || ""}
            onChange={(e)=>setValues(v=>({ ...v, clientId: e.target.value }))}
          />
          <select
            className="w-full border px-3 py-2 rounded"
            value={values.status}
            onChange={(e)=>setValues(v=>({ ...v, status: e.target.value }))}
          >
            <option value="open">Open</option>
            <option value="pending">Pending</option>
            <option value="closed">Closed</option>
          </select>
          <input
            className="w-full border px-3 py-2 rounded"
            placeholder="Primary Lawyer User ID"
            value={values.primaryLawyerId || ""}
            onChange={(e)=>setValues(v=>({ ...v, primaryLawyerId: e.target.value }))}
          />
          <input
            className="w-full border px-3 py-2 rounded"
            placeholder="Assigned User IDs (comma-separated)"
            value={(values.assignedUsers || []).join(",")}
            onChange={(e)=>{
              const arr = e.target.value.split(",").map(s=>s.trim()).filter(Boolean);
              setValues(v=>({ ...v, assignedUsers: arr }));
            }}
          />

          {values.createdAt && (
            <input
              className="w-full border px-3 py-2 rounded bg-gray-50"
              value={new Date(values.createdAt).toLocaleString()}
              readOnly
            />
          )}
        </div>

        <div className="mt-6 flex gap-2 justify-end">
          <button className="px-4 py-2 rounded border" onClick={onClose}>Cancel</button>
          <button className="px-4 py-2 rounded bg-blue-600 text-white" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
