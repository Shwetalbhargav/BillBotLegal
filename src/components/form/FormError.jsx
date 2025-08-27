import React from "react";

export default function FormError({ id, children }) {
  if (!children) return null;
  return <p id={id} className="lb-error">{children}</p>;
}
