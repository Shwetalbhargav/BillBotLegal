// src/components/form/DatePicker.jsx
import React from "react";
import { clsx } from "../../utils/clsx.js";
import FormField from "./FormField";

/**
 * Soft-UI DatePicker (native <input type="date" | "datetime-local">).
 * Works great with react-hook-form Controller: pass value & onChange.
 */
export default function DatePicker({
  name,
  label,
  help,
  required,
  value,
  onChange,
  min,
  max,
  placeholder = "Select date",
  size = "md",
  withTime = false,
  onClear,
  inputClassName,
  ...props
}) {
  const sizes = {
    sm: "h-9 text-[13px]",
    md: "h-10 text-[14px]",
    lg: "h-11 text-[15px]",
  };

  const type = withTime ? "datetime-local" : "date";

  return (
    <FormField name={name} label={label} help={help} required={required}>
      {({ id, describedBy, error }) => (
        <div className="relative">
          <input
            id={id}
            type={type}
            className={clsx(
              "w-full rounded-2xl border bg-[color:var(--lb-surface)]",
              "border-[color:var(--lb-border)] shadow-[var(--lb-shadow-sm)]",
              "px-3",
              sizes[size],
              "text-[color:var(--lb-text)]",
              "placeholder:text-[color:var(--lb-muted)]/80",
              "focus:outline-none focus:ring-2 focus:ring-[color:var(--lb-primary-600)]",
              error && "border-[color:var(--lb-danger-400)]",
              inputClassName
            )}
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

          {value && onClear && (
            <button
              type="button"
              onClick={() => onClear?.()}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-[color:var(--lb-muted)] hover:bg-[color:var(--lb-bg)] focus:outline-none focus:ring-2 focus:ring-[color:var(--lb-primary-600)]"
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
