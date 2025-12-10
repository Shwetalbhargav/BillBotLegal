// src/components/form/FormField.jsx
import React from "react";
import { useFormContext } from "react-hook-form";

export default function FormField({
  name,
  label,
  help,
  required = false,
  className = "",
  children,
}) {
  const {
    formState: { errors },
  } = useFormContext();

  const error = errors?.[name];
  const id = `field-${name}`;
  const describedByIds = [];

  if (help && !error) describedByIds.push(`${id}-help`);
  if (error) describedByIds.push(`${id}-error`);

  const describedBy =
    describedByIds.length > 0 ? describedByIds.join(" ") : undefined;

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="text-[13px] font-medium text-[color:var(--lb-text)] flex items-center gap-1"
        >
          {label}
          {required && (
            <span className="text-[color:var(--lb-danger-700)]">*</span>
          )}
        </label>
      )}

      {children({
        id,
        describedBy,
        error,
      })}

      {help && !error && (
        <p
          id={`${id}-help`}
          className="text-[12px] text-[color:var(--lb-muted)]"
        >
          {help}
        </p>
      )}

      {error && (
        <p
          id={`${id}-error`}
          className="text-[12px] text-[color:var(--lb-danger-700)]"
          role="alert"
        >
          {error.message || String(error)}
        </p>
      )}
    </div>
  );
}
