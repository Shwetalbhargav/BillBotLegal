import React from "react";
import { ChevronDown } from "lucide-react";
import { clsx } from "../../utils/clsx.js";

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
          "lb-reset h-11 w-full appearance-none rounded-[var(--lb-radius-md)] bg-[color:var(--lb-surface)]",
          "border border-[color:var(--lb-border)] px-4 pr-10 text-[var(--lb-fs-md)] shadow-[var(--lb-shadow-xs)]",
          "transition-[border-color,box-shadow,background] focus:outline-none focus-visible:border-[color:var(--lb-primary-600)] focus-visible:shadow-[var(--lb-focus-ring)]",
          invalid && "border-[color:var(--lb-danger-600)] bg-[color:var(--lb-danger-50)]"
        )}
        {...props}
      >
        {children}
      </select>
      <span
        aria-hidden
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[color:var(--lb-muted)]"
      >
        <ChevronDown className="h-4 w-4" />
      </span>
    </div>
  );
}
