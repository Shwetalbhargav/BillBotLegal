// src/components/form/Switch.jsx
import React from "react";
import { clsx } from "../../utils/clsx.js";

export default function Switch({
  checked,
  onChange,
  label,
  disabled = false,
  className,
}) {
  return (
    <label
      className={clsx(
        "lb-reset inline-flex items-center gap-3 select-none",
        disabled && "opacity-60 cursor-not-allowed",
        className
      )}
    >
      <button
        type="button"
        role="switch"
        aria-checked={!!checked}
        onClick={() => !disabled && onChange?.(!checked)}
        className={clsx(
          "relative w-11 h-6 rounded-full transition-colors",
          "border border-[color:var(--lb-border)] shadow-[var(--lb-shadow-sm)]",
          checked
            ? "bg-[color:var(--lb-primary-600)]"
            : "bg-[color:var(--lb-bg)]"
        )}
      >
        <span
          className={clsx(
            "absolute top-1/2 -translate-y-1/2 left-0.5 h-5 w-5 rounded-full bg-white shadow",
            "transition-transform",
            checked && "translate-x-5"
          )}
        />
      </button>
      {label && (
        <span className="text-[var(--lb-fs-sm)]">
          {label}
        </span>
      )}
    </label>
  );
}
