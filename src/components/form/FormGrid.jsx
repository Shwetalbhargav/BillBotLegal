// FormGrid.jsx
import React from "react";

/**
 * Responsive 2/3-column grid for consistent page layouts.
 * Soft-UI friendly spacing; keep the container neutral so child cards/fields can style themselves.
 *
 * Props:
 *  - variant: "two" | "three" (default "two")
 *  - className: optional tailwind classes to extend/override
 */
export default function FormGrid({ variant = "two", children, className }) {
  const base = "grid gap-6 sm:gap-7";
  const cols =
    variant === "three"
      ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
      : "grid-cols-1 md:grid-cols-2";

  return <div className={`${base} ${cols} ${className ?? ""}`}>{children}</div>;
}
