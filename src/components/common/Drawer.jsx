// src/components/common/Drawer.jsx
import React, { useEffect, useRef } from "react";
import { useFocusTrap } from "../../hooks/useFocusTrap";
import { clsx } from "../../utils/clsx.js"
export default function Drawer({
  open,
  onClose,
  title,
  children,
  side = "right", // "left" | "right"
  width = 420,
  preventCloseOnBackdrop = false,
}) {
  const panelRef = useRef(null);
  useFocusTrap(panelRef, null, open);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const onBackdrop = () => {
    if (!preventCloseOnBackdrop) onClose?.();
  };

  const isRight = side !== "left";

  return (
    <div className="lb-reset fixed inset-0 z-[1000]">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
        onClick={onBackdrop}
      />
      <div
        className={clsx(
          "absolute inset-y-0 flex",
          isRight ? "right-0 justify-end" : "left-0 justify-start"
        )}
      >
        <div
          ref={panelRef}
          style={{ width }}
          className={clsx(
            "h-full bg-[color:var(--lb-surface)]",
            "border-[color:var(--lb-border)]",
            isRight ? "border-l" : "border-r",
            "shadow-[var(--lb-shadow-lg)]",
            isRight
              ? "rounded-l-[var(--lb-radius-xl)]"
              : "rounded-r-[var(--lb-radius-xl)]",
            "flex flex-col",
            "animate-[lb-drawer-in_180ms_ease-out]"
          )}
        >
          <header className="flex items-center justify-between gap-3 border-b border-[color:var(--lb-border)] px-4 py-3">
            <h2 className="text-[15px] font-semibold text-[color:var(--lb-text)]">
              {title}
            </h2>
            <button
              type="button"
              className="rounded-[var(--lb-radius-sm)] p-2 hover:bg-[color:var(--lb-bg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--lb-primary-600)]"
              onClick={onClose}
              aria-label="Close"
            >
              ✕
            </button>
          </header>
          <div className="flex-1 overflow-auto p-5 text-[color:var(--lb-text)] text-[13px]">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
