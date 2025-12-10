// src/components/form/Checkbox.jsx
import React from "react";
import { clsx } from "../../utils/clsx";

export default function Checkbox({
  label,
  description,
  invalid = false,
  className,
  ...props
}) {
  return (
    <label
      className={clsx(
        "lb-reset inline-flex items-start gap-2 cursor-pointer select-none",
        className
      )}
    >
      <span className="relative flex h-5 w-5 items-center justify-center">
        <input
          type="checkbox"
          className={clsx(
            "lb-reset peer h-4 w-4 rounded-[0.6rem] border",
            "border-[color:var(--lb-border)] bg-[color:var(--lb-bg)]",
            "shadow-[var(--lb-shadow-xs)]",
            "checked:bg-[color:var(--lb-primary-600)]",
            "checked:border-[color:var(--lb-primary-600)]",
            "focus:outline-none focus-visible:ring-2",
            "focus-visible:ring-[color:var(--lb-primary-600)]",
            invalid && "border-[color:var(--lb-danger-400)]"
          )}
          {...props}
        />
      </span>

      <span className="flex flex-col gap-0.5">
        {label && (
          <span className="text-[13px] font-medium text-[color:var(--lb-text)]">
            {label}
          </span>
        )}
        {description && (
          <span className="text-[12px] text-[color:var(--lb-muted)]">
            {description}
          </span>
        )}
      </span>
    </label>
  );
}
