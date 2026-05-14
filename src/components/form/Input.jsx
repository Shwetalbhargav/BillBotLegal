// src/components/form/Input.jsx
import React from "react";
import { clsx } from "../../utils/clsx.js";

const SIZES = {
  sm: "h-9 text-[var(--lb-fs-sm)] px-3",
  md: "h-11 text-[var(--lb-fs-md)] px-4",
  lg: "h-12 text-[var(--lb-fs-lg)] px-4",
};

export default function Input({
  size = "md",
  invalid = false,
  className,
  leftIcon,
  rightIcon,
  ...props
}) {
  return (
    <div className={clsx("relative", className)}>
      {leftIcon && (
        <span className="absolute inset-y-0 left-3 grid place-items-center pointer-events-none text-[color:var(--lb-muted)]">
          {leftIcon}
        </span>
      )}

      <input
        className={clsx(
          "lb-reset w-full rounded-[var(--lb-radius-md)] bg-[color:var(--lb-surface)]",
          "border border-[color:var(--lb-border)] shadow-[var(--lb-shadow-xs)]",
          "placeholder:text-[color:var(--lb-muted)] text-[color:var(--lb-text)]",
          "transition-[border-color,box-shadow,background] focus:outline-none focus-visible:border-[color:var(--lb-primary-600)] focus-visible:shadow-[var(--lb-focus-ring)]",
          leftIcon && "pl-10",
          rightIcon && "pr-10",
          SIZES[size],
          invalid && "border-[color:var(--lb-danger-600)] bg-[color:var(--lb-danger-50)]"
        )}
        {...props}
      />

      {rightIcon && (
        <span className="absolute inset-y-0 right-3 grid place-items-center pointer-events-none text-[color:var(--lb-muted)]">
          {rightIcon}
        </span>
      )}
    </div>
  );
}
