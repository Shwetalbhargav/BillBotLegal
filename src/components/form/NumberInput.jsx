import React, { useCallback } from "react";
import FormField from "./FormField";
import { clsx } from "../../utils/clsx";

export default function NumberInput({
  label, description, error, required,
  step = 1, precision, min, max, size = "md",
  value, onChange, ...props
}) {
  const sizes = {
    sm: "py-1.5 text-[var(--lb-fs-sm)]",
    md: "py-2 text-[var(--lb-fs-md)]",
    lg: "py-2.5 text-[var(--lb-fs-lg)]",
  };

  const clamp = (v) => {
    let n = Number(v);
    if (Number.isNaN(n)) n = 0;
    if (min !== undefined) n = Math.max(n, Number(min));
    if (max !== undefined) n = Math.min(n, Number(max));
    if (precision !== undefined) n = Number(n.toFixed(precision));
    return n;
  };

  const change = useCallback((delta) => {
    onChange?.({ target: { value: clamp((Number(value) || 0) + delta) } });
  }, [onChange, value]);

  return (
    <FormField label={label} description={description} error={error} required={required}>
      {({ inputId, describedBy }) => (
        <div className="relative flex">
          <button type="button" className="px-2 border border-[color:var(--lb-border)] rounded-l-[var(--lb-radius-md)]"
            onClick={() => change(-step)} aria-label="Decrease">–</button>
          <input
            id={inputId}
            inputMode="decimal"
            className={clsx("lb-input rounded-none border-x-0", sizes[size])}
            style={{ textAlign: "center" }}
            step={step}
            value={value}
            onChange={(e) => onChange?.({ target: { value: clamp(e.target.value) } })}
            aria-invalid={!!error}
            aria-describedby={describedBy}
            required={required}
            {...props}
          />
          <button type="button" className="px-2 border border-[color:var(--lb-border)] rounded-r-[var(--lb-radius-md)]"
            onClick={() => change(step)} aria-label="Increase">+</button>
        </div>
      )}
    </FormField>
  );
}
