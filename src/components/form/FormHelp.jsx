// FormHelp.jsx
import React from "react";

/**
 * FormHelp – lightweight contextual hint text under a field.
 * Uses subtle color and spacing for Soft-UI consistency.
 */
export default function FormHelp({ id, children }) {
  if (!children) return null;

  return (
    <p
      id={id}
      className="mt-1 text-sm text-gray-500/90 select-none transition-opacity"
    >
      {children}
    </p>
  );
}
