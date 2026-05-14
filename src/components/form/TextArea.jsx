// src/components/form/TextArea.jsx
import React from "react";
import { clsx } from "../../utils/clsx.js";

export default function TextArea({
  rows = 4,
  invalid = false,
  className,
  ...props
}) {
  return (
    <textarea
      rows={rows}
      className={clsx(
        "lb-reset w-full rounded-[var(--lb-radius-md)] bg-[color:var(--lb-surface)]",
        "border border-[color:var(--lb-border)] shadow-[var(--lb-shadow-xs)]",
        "placeholder:text-[color:var(--lb-muted)] text-[color:var(--lb-text)]",
        "transition-[border-color,box-shadow,background] focus:outline-none focus-visible:border-[color:var(--lb-primary-600)] focus-visible:shadow-[var(--lb-focus-ring)]",
        "px-4 py-3 text-[var(--lb-fs-md)] leading-relaxed",
        invalid && "border-[color:var(--lb-danger-600)] bg-[color:var(--lb-danger-50)]",
        className
      )}
      {...props}
    />
  );
}
