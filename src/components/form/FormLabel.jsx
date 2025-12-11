// src/components/form/FormLabel.jsx
import React from "react";
import { clsx } from "../../utils/clsx.js";

export default function FormLabel({
  htmlFor,
  children,
  required = false,
  className,
}) {
  if (!children) return null;

  return (
    <label
      htmlFor={htmlFor}
      className={clsx(
        "lb-reset inline-flex items-center gap-1",
        "text-[13px] font-medium tracking-[0.01em]",
        "text-[color:var(--lb-text)]",
        className
      )}
    >
      <span>{children}</span>
      {required && (
        <span className="text-[color:var(--lb-danger-700)]" aria-hidden>
          *
        </span>
      )}
    </label>
  );
}
