// DatePicker.jsx (Soft-UI Refactor)
import React from "react";
import FormField from "./FormLabel"; // your unified FormField component

/**
 * Soft-UI DatePicker
 * Uses native <input type="date" | "datetime-local"> for accessibility and simplicity.
 * Subtle shadows, rounded corners, and focus ring for Soft-UI theme.
 */
export default function DatePicker({
  label,
  help,
  error,
  required,
  value,
  onChange,
  min,
  max,
  placeholder = "Select date",
  size = "md",
  withTime = false,
  onClear,
  ...props
}) {
  const sizes = {
    sm: "py-2 text-sm",
    md: "py-2.5 text-base",
    lg: "py-3 text-lg",
  };

  const type = withTime ? "datetime-local" : "date";

  return (
    <FormField label={label} help={help} required={required}>
      {({ id, describedBy }) => (
        <div className="relative">
          <input
            id={id}
            type={type}
            className={`
              w-full rounded-2xl border border-gray-200/70 bg-white/90
              backdrop-blur-sm shadow-sm px-3 ${sizes[size]} text-gray-900
              placeholder:text-gray-400 transition
              focus:outline-none focus:ring-2 focus:ring-indigo-400/60
              ${value ? "" : "text-gray-400/80"}
            `}
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
              className="
                absolute right-2 top-1/2 -translate-y-1/2 rounded-full
                p-1.5 text-gray-500 hover:bg-gray-100 active:bg-gray-200
                transition focus:outline-none focus:ring-2 focus:ring-indigo-400/60
              "
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
