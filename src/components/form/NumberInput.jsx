// NumberInput.jsx
import React, { useCallback } from "react";
import FormField from "./FormLabel"; // <- this file exports the FormField wrapper

export default function NumberInput({
  label,
  help,
  required,
  step = 1,
  precision,
  min,
  max,
  size = "md",
  value,
  onChange,
  ...props
}) {
  const sizes = {
    sm: "text-sm py-2",
    md: "text-base py-2.5",
    lg: "text-lg py-3",
  };

  const clamp = (v) => {
    let n = Number(v);
    if (Number.isNaN(n)) n = 0;
    if (min !== undefined) n = Math.max(n, Number(min));
    if (max !== undefined) n = Math.min(n, Number(max));
    if (precision !== undefined) n = Number(n.toFixed(precision));
    return n;
  };

  const change = useCallback(
    (delta) => {
      onChange?.({ target: { value: clamp((Number(value) || 0) + delta) } });
    },
    [onChange, value]
  );

  return (
    <FormField label={label} help={help} required={required}>
      {({ id, describedBy, error }) => (
        <div className="inline-flex items-stretch rounded-2xl shadow-sm bg-white border border-gray-200/70 overflow-hidden">
          <button
            type="button"
            className={`px-3 select-none transition
              focus:outline-none focus:ring-2 focus:ring-indigo-400/60
              hover:bg-gray-50 active:bg-gray-100
              text-gray-700`}
            onClick={() => change(-step)}
            aria-label="Decrease"
          >
            –
          </button>

          <input
            id={id}
            inputMode="decimal"
            step={step}
            value={value}
            onChange={(e) =>
              onChange?.({ target: { value: clamp(e.target.value) } })
            }
            aria-invalid={!!error}
            aria-describedby={describedBy}
            required={required}
            className={`w-24 text-center border-x border-gray-200/70 bg-white
              placeholder:text-gray-400 ${sizes[size]}
              focus:outline-none focus:ring-2 focus:ring-indigo-400/60`}
            style={{ MozAppearance: "textfield" }}
            {...props}
          />

          <button
            type="button"
            className={`px-3 select-none transition
              focus:outline-none focus:ring-2 focus:ring-indigo-400/60
              hover:bg-gray-50 active:bg-gray-100
              text-gray-700`}
            onClick={() => change(step)}
            aria-label="Increase"
          >
            +
          </button>
        </div>
      )}
    </FormField>
  );
}
