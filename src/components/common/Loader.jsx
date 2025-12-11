// src/components/common/Loader.jsx
import React from "react";
import { clsx } from "../../utils/clsx.js";

export default function Loader({
  size = 16,
  className,
  label = "Loading…",
  hideLabel = false,
}) {
  const border = Math.max(2, Math.round(size / 8));

  return (
    <div
      className={clsx(
        "lb-reset inline-flex items-center gap-2",
        className
      )}
      role="status"
      aria-live="polite"
    >
      <span
        aria-hidden="true"
        style={{
          width: size,
          height: size,
          borderWidth: border,
          borderStyle: "solid",
          borderColor:
            "var(--lb-border) transparent var(--lb-border) transparent",
          borderRadius: "50%",
          animation: "lb-spin 1s linear infinite",
        }}
      />
      {!hideLabel && (
        <span className="text-[12px] text-[color:var(--lb-muted)]">
          {label}
        </span>
      )}

      <style>{`
        @keyframes lb-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
