// src/components/form/NumberInput.jsx
import React, { useCallback } from "react";
import FormField from "./FormField";
import { clsx } from "../../utils/clsx.js";

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
    sm: "text-[13px] py-2",
    md: "text-[14px] py-2.5",
    lg: "text-[15px] py-3",
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
    <FormField name={props.name} label={label} help={help} required={required}>
      {({ id, describedBy, error }) => (
        <div className="inline-flex items-stretch rounded-2xl bg-[color:var(--lb-surface)] border border-[color:var(--lb-border)] shadow-[var(--lb-shadow-sm)] overflow-hidden">
          <button
            type="button"
            className={clsx(
              "px-3 select-none text-[13px] text-[color:var(--lb-muted)]",
              "hover:bg-[color:var(--lb-bg)] active:bg-[color:var(--lb-bg)]/80",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--lb-primary-600)]"
            )}
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
            className={clsx(
              "w-24 text-center border-x border-[color:var(--lb-border)] bg-[color:var(--lb-surface)]",
              "placeholder:text-[color:var(--lb-muted)]",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--lb-primary-600)]",
              sizes[size]
            )}
            style={{ MozAppearance: "textfield" }}
            {...props}
          />

          <button
            type="button"
            className={clsx(
              "px-3 select-none text-[13px] text-[color:var(--lb-muted)]",
              "hover:bg-[color:var(--lb-bg)] active:bg-[color:var(--lb-bg)]/80",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--lb-primary-600)]"
            )}
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
