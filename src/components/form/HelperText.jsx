// src/components/form/HelperText.jsx
import React from "react";

export default function HelperText({ id, children }) {
  if (!children) return null;

  return (
    <p
      id={id}
      className="mt-1 text-[12px] leading-relaxed text-[color:var(--lb-muted)]"
    >
      {children}
    </p>
  );
}
