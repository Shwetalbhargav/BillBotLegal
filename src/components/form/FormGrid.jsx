import React from "react";

/** 2/3‑column responsive grid for consistent page layouts */
export default function FormGrid({ variant = "two", children }) {
  const base = "grid gap-6";
  const cols = variant === "three"
    ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
    : "grid-cols-1 md:grid-cols-2";
  return <div className={`${base} ${cols}`}>{children}</div>;
}
