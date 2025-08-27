import React from "react";
import { clsx } from "../../utils/clsx";

export default function Loader({ size = 16, className, label = "Loading…" }) {
  const border = Math.max(2, Math.round(size / 8));
  return (
    <div className={clsx("lb-reset inline-flex items-center gap-2", className)} role="status" aria-live="polite">
      <span
        aria-hidden="true"
        style={{
          width: size, height: size, borderWidth: border,
          borderStyle: "solid",
          borderColor: "rgba(0,0,0,.15) transparent rgba(0,0,0,.15) transparent",
          borderRadius: "50%",
          animation: "lb-spin 1s linear infinite"
        }}
      />
      <span className="sr-only">{label}</span>
      <style>{`@keyframes lb-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
