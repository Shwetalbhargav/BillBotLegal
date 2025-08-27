import React from "react";
import FormField from "./FormField";
import { clsx } from "../../utils/clsx";

/**
 * Lightweight date picker: uses native <input type="date"> for reliability/a11y.
 * Props: min, max, placeholder, onClear, error, required, size, withTime=false
 */
export default function DatePicker({
  label, description, error, required,
  value, onChange, min, max,
  placeholder = "Select date",
  size = "md",
  withTime = false,
  onClear,
  ...props
}) {
  const sizes = {
    sm: "py-1.5 text-[var(--lb-fs-sm)]",
    md: "py-2 text-[var(--lb-fs-md)]",
    lg: "py-2.5 text-[var(--lb-fs-lg)]",
  };

  const type = withTime ? "datetime-local" : "date";

  return (
    <FormField label={label} description={description} error={error} required={required}>
      {({ inputId, describedBy }) => (
        <div className="relative">
          <input
            id={inputId}
            type={type}
            className={clsx("lb-input", sizes[size], value ? "" : "text-[color:var(--lb-muted)]")}
            aria-invalid={!!error}
            aria-describedby={describedBy}
            required={required}
            value={value || ""}
            onChange={(e) => onChange?.(e.target.value)}
            min={min}
            max={max}
            placeholder={placeholder}
            {...props}
          />
          {(value && onClear) && (
            <button
              type="button"
              onClick={() => onClear?.()}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 hover:bg-[color:var(--lb-surface)]"
              aria-label="Clear date"
            >
              ✕
            </button>
          )}
        </div>
      )}
    </FormField>
  );
}
