import React from "react";
import { clsx } from "../../utils/clsx";

export default function Switch({ checked, onChange, disabled, label, description, id }) {
  return (
    <label className="lb-reset flex items-start gap-3 cursor-pointer">
      <span
        role="switch"
        aria-checked={!!checked}
        aria-disabled={disabled || undefined}
        tabIndex={0}
        onKeyDown={(e)=>{ if (e.key === " " || e.key === "Enter") { e.preventDefault(); onChange?.(!checked); } }}
        onClick={()=> !disabled && onChange?.(!checked)}
        className={clsx(
          "relative inline-flex h-6 w-10 items-center rounded-full transition-colors",
          checked ? "bg-[color:var(--lb-primary-600)]" : "bg-[color:var(--lb-border)]",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        id={id}
      >
        <span
          className={clsx(
            "inline-block h-5 w-5 rounded-full bg-white transform transition-transform",
            checked ? "translate-x-5" : "translate-x-1"
          )}
        />
      </span>
      <span className="select-none">
        {label && <div className="font-medium">{label}</div>}
        {description && <div className="lb-help">{description}</div>}
      </span>
    </label>
  );
}
