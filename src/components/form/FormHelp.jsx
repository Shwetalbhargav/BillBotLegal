import React from "react";

export default function FormHelp({ id, children }) {
  if (!children) return null;
  return <p id={id} className="lb-help">{children}</p>;
}
