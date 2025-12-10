// src/components/form/FormGrid.jsx
import React from "react";

export default function FormGrid({ variant = "two", children, className }) {
  const base = "grid gap-6 sm:gap-7";
  const cols =
    variant === "three"
      ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
      : "grid-cols-1 md:grid-cols-2";

  return <div className={`${base} ${cols} ${className ?? ""}`}>{children}</div>;
}
