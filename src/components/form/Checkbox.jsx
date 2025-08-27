import React from "react";
import { clsx } from "../../utils/clsx";

export default function Checkbox({ checked, onChange, disabled, label, description, id, required, error }) {
  return (
    <div className="lb-reset">
      <label className={clsx("flex items-start gap-3", disabled && "opacity-50 cursor-not-allowed")}>
        <input
          id={id}
          type="checkbox"
          className="h-4 w-4 rounded border-[color:var(--lb-border)]"
          checked={!!checked}
          onChange={(e)=>onChange?.(e.target.checked)}
          disabled={disabled}
          required={required}
          aria-invalid={!!error}
        />
        <span>
          {label && <div className="font-medium">{label}</div>}
          {description && <div className="lb-help">{description}</div>}
          {error && <div className="lb-error">{error}</div>}
        </span>
      </label>
    </div>
  );
}
