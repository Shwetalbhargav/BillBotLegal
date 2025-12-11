// src/components/common/Modal.jsx
import React, { useEffect, useRef } from "react";
import { useFocusTrap } from "../../hooks/useFocusTrap";
import { clsx } from "@utils/clsx.js";

export default function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = "md", // sm | md | lg | xl
  preventCloseOnBackdrop = false,
  hideClose = false,
}) {
  const dialogRef = useRef(null);
  const triggerRef = useRef(null);
  useFocusTrap(dialogRef, triggerRef, open);

  useEffect(() => {
    const onEsc = (e) => e.key === "Escape" && open && onClose?.();
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  if (!open) return null;

  const handleBackdrop = () => {
    if (!preventCloseOnBackdrop) onClose?.();
  };

  const sizes = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  return (
    <div
      className="lb-reset fixed inset-0 z-[1000] grid place-items-center"
      aria-modal="true"
      role="dialog"
    >
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
        onClick={handleBackdrop}
      />

      <div
        ref={dialogRef}
        className={clsx(
          "relative z-[1001] w-[92vw]",
          "rounded-[var(--lb-radius-xl)] bg-[color:var(--lb-surface)]",
          "border border-[color:var(--lb-border)] shadow-[var(--lb-shadow-lg)]",
          "animate-[lb-drawer-in_180ms_ease-out]",
          sizes[size]
        )}
      >
        {(title || !hideClose) && (
          <header className="flex items-center justify-between gap-3 px-5 py-4 border-b border-[color:var(--lb-border)]">
            {title && (
              <h2 className="m-0 text-[15px] font-semibold tracking-[-0.01em] text-[color:var(--lb-text)]">
                {title}
              </h2>
            )}
            {!hideClose && (
              <button
                className="rounded-[var(--lb-radius-sm)] p-2 hover:bg-[color:var(--lb-bg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--lb-primary-600)]"
                onClick={onClose}
                aria-label="Close"
                ref={triggerRef}
              >
                ✕
              </button>
            )}
          </header>
        )}

        <div className="px-5 py-4 text-[14px] text-[color:var(--lb-text)]">
          {children}
        </div>

        {footer && (
          <footer className="px-5 py-4 border-t border-[color:var(--lb-border)] bg-[color:var(--lb-bg)] rounded-b-[var(--lb-radius-xl)] flex justify-end gap-2">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
}
