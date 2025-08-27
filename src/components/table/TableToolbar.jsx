import React from "react";
import { Button } from "@/components/common";
import { Input, Select } from "@/components/form";

// re-export convenience controls so pages can import from the toolbar
export { Input as ToolbarInput, Select as ToolbarSelect } from "@/components/form";

export default function TableToolbar({ children, rightActions = [] }) {
  return (
    <div className="lb-reset flex items-center justify-between gap-4 mb-3">
      <div className="flex flex-wrap items-center gap-3">{children}</div>
      <div className="flex items-center gap-2">
        {rightActions.map((a, i) => (
          <Button key={i} onClick={a.onClick} variant={a.variant ?? "primary"} size="sm">
            {a.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
