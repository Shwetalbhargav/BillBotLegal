// src/components/form/FormError.jsx
import React from "react";

export default function FormError({ id, children }) {
  if (!children) return null;
  return (
    <p
      id={id}
      className="m-0 text-[12px] text-[color:var(--lb-danger-700)]"
      role="alert"
    >
      {children}
    </p>
  );
}
