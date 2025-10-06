import React, { useEffect, useRef } from "react";
import { useFocusTrap } from "../../hooks/useFocusTrap";
import { clsx } from "../../utils/clsx";

export default function Drawer({
  open,
  onClose,
  title,
  children,
  side = "right", // left | right
  width = 420,
  preventCloseOnBackdrop = false,
}) {
  const panelRef = useRef(null);
  useFocusTrap(panelRef, null, open);

  useEffect(() => {
    const onEsc = (e) => e.key === "Escape" && open && onClose?.();
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  if (!open) return null;

  const onBackdrop = () => {
    if (!preventCloseOnBackdrop) onClose?.();
  };

  return (
    <div className="lb-reset fixed inset-0 z-[1000]">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onBackdrop} />
      <div
        ref={panelRef}
        className={clsx(
          "absolute top-0 bottom-0 bg-[color:var(--lb-surface)] shadow-[var(--lb-shadow-lg)]",
          "border-l border-[color:var(--lb-border)] transition-transform",
          side === "right" ? "right-0" : "left-0"
        )}
        style={{ width }}
        role="dialog"
        aria-modal="true"
      >
        <header className="flex items-center justify-between px-5 py-4 border-b border-[color:var(--lb-border)]">
          <h2 className="text-[var(--lb-fs-lg)] m-0 text-[color:var(--lb-text)] font-semibold">{title}</h2>
          <button
            className="rounded-[var(--lb-radius-sm)] p-2 hover:bg-[color:var(--lb-bg)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--lb-primary-600)]"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </header>
        <div className="p-5 overflow-auto h-[calc(100%-60px)] text-[color:var(--lb-text)]">
          {children}
        </div>
      </div>
    </div>
  );
}