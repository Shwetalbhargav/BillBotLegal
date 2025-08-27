import React from "react";
import { clsx } from "../../utils/clsx";

const VARIANTS = {
  primary: "bg-[color:var(--lb-primary-600)] text-white hover:opacity-95",
  secondary: "bg-[color:var(--lb-surface)] text-[color:var(--lb-text)] border border-[color:var(--lb-border)] hover:bg-[color:var(--lb-bg)]",
  danger: "bg-[color:var(--lb-danger-600)] text-white hover:opacity-95",
  ghost: "bg-transparent text-[color:var(--lb-text)] hover:bg-[color:var(--lb-surface)]",
  link: "bg-transparent text-[color:var(--lb-primary-700)] underline-offset-2 hover:underline",
};

const SIZES = {
  sm: "text-[var(--lb-fs-sm)] px-3 py-1.5",
  md: "text-[var(--lb-fs-md)] px-4 py-2",
  lg: "text-[var(--lb-fs-lg)] px-5 py-2.5",
};

export function Button({
  as: Tag = "button",
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  disabled = false,
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
        "lb-reset inline-flex items-center justify-center gap-2 rounded-[var(--lb-radius-md)] font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--lb-primary-600)]",
        VARIANTS[variant],
        SIZES[size],
        fullWidth && "w-full",
        isDisabled && "opacity-60 cursor-not-allowed",
        className
      )}
      aria-busy={loading || undefined}
      disabled={Tag === "button" ? isDisabled : undefined}
      {...props}
    >
      {iconLeft ? <span aria-hidden="true">{iconLeft}</span> : null}
      <span>{children}</span>
      {iconRight ? <span aria-hidden="true">{iconRight}</span> : null}
    </Tag>
  );
}
export default Button;
