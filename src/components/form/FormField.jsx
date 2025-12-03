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
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="text-sm font-medium text-slate-800 flex items-center gap-1"
        >
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* IMPORTANT: no pointer-events-none, no disabled wrapper, no overlay */}
      {children({
        id,
        describedBy,
        error,
      })}

      {help && !error && (
        <p id={`${id}-help`} className="text-xs text-slate-500">
          {help}
        </p>
      )}

      {error && (
        <p
          id={`${id}-error`}
          className="text-xs text-red-600"
          role="alert"
        >
          {error.message || String(error)}
        </p>
      )}
    </div>
  );
}
