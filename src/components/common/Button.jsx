// src/components/common/Button.jsx
// Soft-UI Button
import React from "react";
import { clsx } from "../../utils/clsx.js";

const VARIANTS = {
  primary:
    "bg-[color:var(--lb-primary-600)] text-white border-[color:var(--lb-primary-700)] " +
    "shadow-[var(--lb-shadow-blue)] hover:bg-[color:var(--lb-primary-500)] active:bg-[color:var(--lb-primary-700)]",

  secondary:
    "bg-[color:var(--lb-surface)] text-[color:var(--lb-primary-700)] " +
    "border-[color:var(--lb-border)] shadow-[var(--lb-shadow-sm)] hover:border-[color:var(--lb-primary-200)] hover:bg-[color:var(--lb-primary-50)]",

  subtle:
    "bg-[color:var(--lb-surface-subtle)] text-[color:var(--lb-text)] border-transparent shadow-none hover:bg-[color:var(--lb-primary-100)]",

  ghost:
    "bg-transparent text-[color:var(--lb-muted-strong)] border-transparent shadow-none hover:bg-[color:var(--lb-surface-subtle)] hover:text-[color:var(--lb-primary-700)]",

  danger:
    "bg-[color:var(--lb-danger-600)] text-white border-[color:var(--lb-danger-700)] shadow-[var(--lb-shadow-danger)] hover:bg-[color:var(--lb-danger-700)]",

  warning:
    "bg-[color:var(--lb-warning-600)] text-white border-[color:var(--lb-warning-700)] shadow-[var(--lb-shadow-md)] hover:bg-[color:var(--lb-warning-700)]",

  link:
    "bg-transparent border-transparent shadow-none px-0 py-0 " +
    "text-[color:var(--lb-primary-600)] hover:underline",
};

const SIZES = {
  xs: "h-7 px-3 text-[11px]",
  sm: "h-9 px-4 text-[13px]",
  md: "h-11 px-5 text-[14px]",
  lg: "h-12 px-6 text-[16px]",
};

export function Button({
  as: Tag = "button",
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  disabled,
  iconLeft,
  iconRight,
  className,
  children,
  ...props
}) {
  const isDisabled = disabled || loading;

  return (
    <Tag
      className={clsx(
        "lb-reset inline-flex items-center justify-center gap-2",
        "rounded-[var(--lb-radius-md)] border font-bold tracking-[0.01em]",
        "transition-[background,border-color,box-shadow,transform] duration-150 ease-out",
        "active:translate-y-px",
        "focus-visible:outline-none focus-visible:ring-2",
        "focus-visible:ring-[color:var(--lb-primary-600)] focus-visible:ring-offset-1",
        "disabled:opacity-60 disabled:cursor-not-allowed",
        VARIANTS[variant] || VARIANTS.primary,
        SIZES[size] || SIZES.md,
        fullWidth && "w-full",
        className
      )}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <span
            className="h-3.5 w-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin"
            aria-hidden="true"
          />
          <span className="text-[12px]">Loading…</span>
        </span>
      ) : (
        <>
          {iconLeft && <span aria-hidden="true">{iconLeft}</span>}
          <span>{children}</span>
          {iconRight && <span aria-hidden="true">{iconRight}</span>}
        </>
      )}
    </Tag>
  );
}

export default Button;
