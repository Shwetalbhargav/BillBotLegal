// src/components/form/FormRow.jsx
import React from "react";
import { clsx } from "../../utils/clsx";

export default function FormRow({
  label,
  control,
  helper,
  error,
  className,
}) {
  return (
    <div
      className={clsx(
        "lb-reset grid items-start gap-3 md:grid-cols-[220px_1fr]",
        className
      )}
    >
      <div className="pt-2 text-[13px] font-medium text-[color:var(--lb-text)]">
        {label}
      </div>
      <div className="flex flex-col gap-1">
        {control}
        {error ? (
          <p className="m-0 text-[12px] text-[color:var(--lb-danger-700)]">
            {error}
          </p>
        ) : helper ? (
          <p className="m-0 text-[12px] text-[color:var(--lb-muted)]">
            {helper}
          </p>
        ) : null}
      </div>
    </div>
  );
}
