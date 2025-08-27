import React from "react";
import FormField from "./FormField";
import { clsx } from "../../utils/clsx";

export default function Select({
  label, description, error, required,
  leftIcon, rightIcon, size = "md", children, ...props
}) {
  const sizes = {
    sm: "py-1.5 text-[var(--lb-fs-sm)]",
    md: "py-2 text-[var(--lb-fs-md)]",
    lg: "py-2.5 text-[var(--lb-fs-lg)]",
  };
  return (
    <FormField label={label} description={description} error={error} required={required}>
      {({ inputId, describedBy }) => (
        <div className="relative">
          {leftIcon && <span className="absolute left-3 top-1/2 -translate-y-1/2 opacity-70" aria-hidden="true">{leftIcon}</span>}
          <select
            id={inputId}
            className={clsx("lb-input appearance-none", sizes[size], leftIcon && "pl-9", rightIcon && "pr-9")}
            aria-invalid={!!error}
            aria-describedby={describedBy}
            required={required}
            {...props}
          >
            {children}
          </select>
          {rightIcon && <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 opacity-70" aria-hidden="true">{rightIcon}</span>}
        </div>
      )}
    </FormField>
  );
}
