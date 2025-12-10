// src/components/form/FormHelp.jsx
import React from "react";

export default function FormHelp({ id, children }) {
  if (!children) return null;

  return (
    <p
      id={id}
      className="mt-1 text-[12px] text-[color:var(--lb-muted)] transition-opacity"
    >
      {children}
    </p>
  );
}
