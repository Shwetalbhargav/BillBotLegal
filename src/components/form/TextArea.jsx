import React from "react";
import FormField from "./FormField";
import { clsx } from "../../utils/clsx";

export default function TextArea({
  label, description, error, required,
  rows = 4, size = "md", ...props
}) {
  const sizes = {
    sm: "text-[var(--lb-fs-sm)]",
    md: "text-[var(--lb-fs-md)]",
    lg: "text-[var(--lb-fs-lg)]",
  };
  return (
    <FormField label={label} description={description} error={error} required={required}>
      {({ inputId, describedBy }) => (
        <textarea
          id={inputId}
          className={clsx("lb-input resize-vertical", sizes[size])}
          rows={rows}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          required={required}
          {...props}
        />
      )}
    </FormField>
  );
}
