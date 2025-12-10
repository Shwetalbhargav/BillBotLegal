// src/components/form/Select.jsx
import React from "react";
import { clsx } from "../../utils/clsx";

export default function Select({
  invalid = false,
  className,
  children,
  ...props
}) {
  return (
    <div className={clsx("relative", className)}>
      <select
        className={clsx(
          "lb-reset w-full appearance-none rounded-2xl bg-[color:var(--lb-surface)]",
          "border border-[color:var(--lb-border)] shadow-[var(--lb-shadow-sm)]",
          "text-[var(--lb-fs-md)]",
          "px-3.5 h-10",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--lb-primary-600)]",
          invalid && "border-[color:var(--lb-danger-400)]"
        )}
        {...props}
      >
        {children}
      </select>
      <span
        aria-hidden
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[color:var(--lb-muted)]"
      >
        ▾
      </span>
    </div>
  );
}
