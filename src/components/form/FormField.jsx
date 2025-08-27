import React, { useId } from "react";
import { clsx } from "../../utils/clsx";

/**
 * Shared wrapper for label/description/error and a11y wiring.
 * Generates ids and passes them to children via render props.
 */
export default function FormField({
  label,
  description,
  error,
  required = false,
  children,
  className
}) {
  const id = useId();
  const describedBy = [
    description ? `${id}-desc` : null,
    error ? `${id}-err` : null,
  ].filter(Boolean).join(" ") || undefined;

  return (
    <div className={clsx("lb-reset lb-field", className)}>
      {label && (
        <label htmlFor={id} className="font-medium">
          {label} {required && <span aria-hidden="true" className="text-[color:var(--lb-danger-600)]">*</span>}
        </label>
      )}
      {children({ inputId: id, describedBy })}
      {description && !error && (
        <div id={`${id}-desc`} className="lb-help">{description}</div>
      )}
      {error && (
        <div id={`${id}-err`} className="lb-error">{error}</div>
      )}
    </div>
  );
}
