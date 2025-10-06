// Button.jsx (Soft-UI Refactor)
import React from "react";
import { clsx } from "../../utils/clsx";

const VARIANTS = {
  primary:
    // Indigo primary with soft shadow + hover/active states
    "bg-indigo-600 text-white shadow-sm hover:bg-indigo-500 active:bg-indigo-600 focus-visible:ring-indigo-400/60",
  secondary:
    // Subtle surface button
    "bg-white text-gray-900 border border-gray-200/70 shadow-sm hover:bg-gray-50 active:bg-gray-100 focus-visible:ring-indigo-300/50",
  danger:
    "bg-rose-600 text-white shadow-sm hover:bg-rose-500 active:bg-rose-600 focus-visible:ring-rose-400/60",
  ghost:
    "bg-transparent text-gray-700 hover:bg-gray-50 active:bg-gray-100 focus-visible:ring-indigo-300/50",
  link:
    "bg-transparent text-indigo-600 underline-offset-2 hover:underline focus-visible:ring-indigo-300/50",
};

const SIZES = {
  sm: "text-sm px-3 py-2 rounded-xl",
  md: "text-base px-4 py-2.5 rounded-2xl",
  lg: "text-lg px-5 py-3 rounded-2xl",
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
        "inline-flex items-center justify-center gap-2 font-medium antialiased",
        "transition-colors focus:outline-none focus-visible:ring-2",
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
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <svg
            className="h-4 w-4 animate-spin"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
          <span>Loading…</span>
        </span>
      ) : (
        <>
          {iconLeft ? <span aria-hidden="true">{iconLeft}</span> : null}
          <span>{children}</span>
          {iconRight ? <span aria-hidden="true">{iconRight}</span> : null}
        </>
      )}
    </Tag>
  );
}

export default Button;
