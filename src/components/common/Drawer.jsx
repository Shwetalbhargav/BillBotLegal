import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { useFocusTrap } from "../../hooks/useFocusTrap";
import { clsx } from "../../utils/clsx.js";

export default function Drawer({
  open,
  onClose,
  title,
  eyebrow,
  children,
  footer,
  side = "right",
  width = 460,
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

  const isRight = side !== "left";
  const onBackdrop = () => {
    if (!preventCloseOnBackdrop) onClose?.();
  };

  return (
    <div className="lb-reset fixed inset-0 z-[1000]">
      <div
        className="absolute inset-0 bg-[#080f22]/30 backdrop-blur-[5px]"
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
          style={{ width: `min(${width}px, 100vw)` }}
          className={clsx(
            "h-full bg-[color:var(--lb-surface)]",
            "border-[color:var(--lb-border)]",
            isRight ? "border-l" : "border-r",
            "shadow-[var(--lb-shadow-lg)]",
            "flex flex-col animate-[lb-drawer-in_180ms_ease-out]"
          )}
        >
          <header className="flex items-start justify-between gap-4 border-b border-[color:var(--lb-border)] px-6 py-5">
            <div>
              {eyebrow && <div className="lb-kicker mb-2">{eyebrow}</div>}
              <h2 className="text-[24px] font-extrabold tracking-[-0.01em] text-[color:var(--lb-text)]">
                {title}
              </h2>
            </div>
            <button
              type="button"
              className="rounded-[var(--lb-radius-sm)] p-2 text-[color:var(--lb-muted-strong)] hover:bg-[color:var(--lb-surface-subtle)] hover:text-[color:var(--lb-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--lb-primary-600)]"
              onClick={onClose}
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </header>
          <div className="flex-1 overflow-auto p-6 text-[color:var(--lb-text)] text-[14px]">
            {children}
          </div>
          {footer && (
            <footer className="border-t border-[color:var(--lb-border)] bg-[color:var(--lb-surface-subtle)] p-5">
              {footer}
            </footer>
          )}
        </div>
      </div>
    </div>
  );
}
