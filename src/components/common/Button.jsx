// src/components/common/Button.jsx
// Soft-UI Button
import React from "react";
import { clsx } from "../../utils/clsx";

const VARIANTS = {
  primary:
    "bg-[color:var(--lb-primary-600)] text-white border-transparent " +
    "shadow-[var(--lb-shadow-sm)] hover:shadow-[var(--lb-shadow-md)] " +
    "hover:brightness-105 active:brightness-95",

  secondary:
    "bg-[color:var(--lb-surface)] text-[color:var(--lb-text)] " +
    "border-[color:var(--lb-border)] shadow-[var(--lb-shadow-sm)] " +
    "hover:bg-[color:var(--lb-bg)]",

  subtle:
    "bg-[color:var(--lb-bg)] text-[color:var(--lb-text)] border-transparent " +
    "shadow-none hover:bg-[color:var(--lb-surface)]",

  ghost:
    "bg-transparent text-[color:var(--lb-text)] border-transparent " +
    "shadow-none hover:bg-[color:var(--lb-bg)]",

  danger:
    "bg-red-500 text-white border-transparent shadow-[var(--lb-shadow-sm)] " +
    "hover:bg-red-500/90",

  link:
    "bg-transparent border-transparent shadow-none px-0 py-0 " +
    "text-[color:var(--lb-primary-600)] hover:underline",
};

const SIZES = {
  xs: "h-7 px-3 text-[11px]",
  sm: "h-8 px-3.5 text-[12px]",
  md: "h-9 px-4 text-[13px]",
  lg: "h-10 px-5 text-[14px]",
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
        "rounded-[999px] border font-medium tracking-[0.01em]",
        "transition-shadow duration-150 ease-out",
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
