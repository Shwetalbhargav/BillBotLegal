import React from "react";
import FormField from "./FormField";
import { clsx } from "../../utils/clsx";

export default function Input({
  label, description, error, required,
  prefix, suffix, leftIcon, rightIcon,
  size = "md",
  ...props
}) {
  const sizes = {
    sm: "py-1.5 text-[var(--lb-fs-sm)]",
    md: "py-2 text-[var(--lb-fs-md)]",
    lg: "py-2.5 text-[var(--lb-fs-lg)]",
  };

  return (
    <FormField label={label} description={description} error={error} required={required}>
      {({ inputId, describedBy }) => (
        <div className="relative">
          {leftIcon && <span className="absolute left-3 top-1/2 -translate-y-1/2 opacity-70" aria-hidden="true">{leftIcon}</span>}
          {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 opacity-70">{prefix}</span>}
          <input
            id={inputId}
            className={clsx(
              "lb-input",
              sizes[size],
              (leftIcon || prefix) && "pl-9",
              (rightIcon || suffix) && "pr-9"
            )}
            aria-invalid={!!error}
            aria-describedby={describedBy}
            required={required}
            {...props}
          />
          {rightIcon && <span className="absolute right-3 top-1/2 -translate-y-1/2 opacity-70" aria-hidden="true">{rightIcon}</span>}
          {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 opacity-70">{suffix}</span>}
        </div>
      )}
    </FormField>
  );
}
